
const { google } = require('googleapis');
const UserType = require("../constants/user.types")
const db = require("../db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const redirectUri = "https://edumatch.canadacentral.cloudapp.azure.com/redirect";

const DEFAULT_RECOMMENDATION_WEIGHTS = {
    budget: 50,
    minRating: 3,
    locationModeWeight: 0.5,
    maxDistance: 20
}

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

    verify(idToken, authCode).then(result => {
        const jwtToken = jwt.sign(result.userId, secretKey)
        return res.json({ 
            jwtToken,
            newUser: result.newUser,
            type: result.type
        })
    }).catch(err => {
        console.log(err)
        return res.status(401).send({ message: err.message })
    })
}

exports.signup = async (req, res) => {
    console.log("signing up user")
    var data = {...req.body}
    var token = req.header('Authorization')
    if (!token) {
        data.password = bcrypt.hashSync(data.password)
        new User({
            ...data,
            recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS
        }).save().then(user => {
            if (!user) {
                return res.status(500).send({ message: "Unable to create user"})
            }
            console.log(`new user: ${user}`)
            const jwtToken = jwt.sign(user._id.toString(), secretKey)
            return res.json({ jwtToken })
        }).catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
        })
    } else {
        token = token.replace("Bearer ", "")
        jwt.verify(token, secretKey, (err, userId) => {
            if (err) {
                console.log(err)
                return res.status(403).send({ message: "Failed to verify JWT"}); // Forbidden
            }
            User.findByIdAndUpdate(userId, {
                ...data,
                recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS
            }, {new: true}).then(() => {
                return res.status(200).send({
                    jwtToken: token
                })
            }).catch(err => {
                console.log(err)
                return res.status(500).send({ message: err.message })
            })
        });
    }
}

// Adapted from: https://www.bezkoder.com/node-js-mongodb-auth-jwt/ 
exports.login = (req, res) => {
    User.findOne({
        username: req.body.username
    }).then(user => {
        if (!user) {
            return res.status(401).send({ message: "Username or password is incorrect" })
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        )
        
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Username or password is incorrect" })
        }

        const jwtToken = jwt.sign(user._id.toString(), secretKey)
        return res.status(200).send({
            jwtToken,
            type: user.type
        })
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
                user.useGoogleCalendar = true
            }

            return user.save().then(savedUser => {
                var ret = {
                    userId: savedUser._id.toString(),
                    newUser: true,
                    type: null
                }
                return Promise.resolve(ret)
            })
        } else {
            var ret = {
                userId: user._id.toString(),
                newUser: false,
                type: user.type
            }
            return Promise.resolve(ret)
        }
    }).catch(err => {
        return Promise.reject(err)
    })
}

async function getGoogleAccessTokens(authCode) {
    const { tokens } = await OAuth2Client.getToken(authCode)
    return Promise.resolve(tokens)
}