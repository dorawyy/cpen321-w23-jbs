
const { google } = require('googleapis');
const UserType = require("../constants/user.types")
const db = require("../db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const redirectUri = "https://localhost:8080/redirect";

const secretKey = process.env.SECRET_KEY

const OAuth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    redirectUri  // Use a placeholder redirect_uri
);

// models
const User = db.user

exports.googleAuth = (req, res) => {
    const idToken = req.body.idToken
    const authCode = req.body.authCode

    verify(idToken, authCode).then(userId => {
        const jwtToken = jwt.sign(userId, secretKey)
        res.json({ jwtToken })
    }).catch(err => {
        console.log(err)
        res.status(401).send({ message: err.message })
    })
}

exports.signup = async (req, res) => {
    var data = {...req.body}
    data.password = bcrypt.hashSync(data.password)
    if (data.authCode) {
        const tokens = await getGoogleAccessTokens(data.authCode)
        if (tokens) {
            data.googleOauth = {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: tokens.expiry_date
            }
        }
    }

    new User({...data}).save().then(user => {
        if (!user) {
            res.status(500).send({ message: "Unable to create user"})
        }
        const jwtToken = jwt.sign(user._id.toString(), secretKey)
        res.json({ jwtToken })
    }).catch(err => {
        console.log(err)
        res.status(500).send({ message: err.message })
    })
}

async function verify(idToken, authCode) {
    const ticket = await OAuth2Client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID
    })
    const payload = ticket.getPayload()
    const googleId = payload['sub']

    return User.findOne({ googleId }).then(async user => {
        if (!user) {
            var user = new User({
                googleId,
                email: payload['email'],
                displayedName: payload['name']
            })

            const tokens = await getGoogleAccessTokens(authCode)
            if (tokens) {
                user.googleOauth = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiryDate: tokens.expiry_date
                }
            }

            return user.save().then(savedUser => {
                return Promise.resolve(savedUser._id.toString())
            })
        } else {
            return Promise.resolve(user._id.toString())
        }
    }).catch(err => {
        return Promise.reject(err)
    })
}

async function getGoogleAccessTokens(authCode) {
    const { tokens } = await OAuth2Client.getToken(authCode)
    return Promise.resolve(tokens)
}