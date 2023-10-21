
const { google } = require('googleapis');
const UserType = require("../constants/user.types")
const db = require("../db")
const jwt = require("jsonwebtoken")

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

    console.log(`idtoken : ${idToken}`)
    console.log(authCode)

    verify(idToken, authCode).then(userId => {
        console.log(`user id: ${userId}`)
        const jwtToken = jwt.sign(userId, secretKey)
        res.json({ jwtToken })
    }).catch(err => {
        console.log(err)
        res.status(401).send({ message: err.message })
    })
}

async function verify(idToken, authCode) {
    // const ticket = await client.verifyIdToken({
    //     idToken,
    //     audience: process.env.CLIENT_ID
    // })
    // const payload = ticket.getPayload()
    var payload = {
        sub: "fdklsjafskl",
        email: "blah@gmail.com",
        name: "arya"
    }
    const googleId = payload['sub']

    return User.findOne({ googleId }).then(user => {
        if (!user) {
            var user = new User({
                googleId,
                email: payload['email'],
                displayedName: payload['name']
            })

            getGoogleAccessTokens(authCode).then(tokens => {
                user.googleOauth = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiryDate: tokens.expiry_date
                }
            })

            user.save().then(savedUser => {
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
    // const { tokens } = await OAuth2Client.getToken(authCode)
    const tokens = {
        access_token: "lkjfdsaklf",
        refresh_token: "falsdkjfals",
        expiry_date: "falskdjfk"
    }
    return Promise.resolve(tokens)
}