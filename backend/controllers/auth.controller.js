
const { google } = require('googleapis');
const UserType = require("../constants/user.types")
const db = require("../db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs");
const { getGoogleAccessTokens } = require('../utils/google.utils');

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

// ChatGPT usage: No
exports.googleAuth = (req, res) => {
    try {
        const idToken = req.body.idToken
        const authCode = req.body.authCode
    
        verify(idToken, authCode).then(result => {
            if (result.isBanned) {
                return res.status(404).send({message: "User is banned"})
            }
            const jwtToken = jwt.sign(result.userId, secretKey)
            return res.json({ 
                jwtToken,
                newUser: result.newUser,
                type: result.type ? result.type : null
            })
        }).catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
}

// ChatGPT usage: No
exports.signup = async (req, res) => {
    console.log("signing up user");

    try {
        var data = {...req.body}
        if (data.type && data.type === UserType.ADMIN) {
            return res.status(403).send({
                message: "Signing up as admin is not allowed"
            })
        }
        var token = req.header('Authorization')
        if (!token) {
            data.password = bcrypt.hashSync(data.password)
            new User({
                ...data,
                recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS,
                hasSignedUp: true
            }).save().then(user => {
                if (!user) {
                    return res.status(500).send({ 
                        message: "Unable to create user"
                    })
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
                    recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS,
                    hasSignedUp: true
                }, {new: true}).then(user => {
                    if (!user || user.isBanned) {
                        return res.status(404).send({
                            message: "User not found. If manually signing up, remove Auth header."
                        })
                    }
                    return res.status(200).send({
                        jwtToken: token
                    })
                }).catch(err => {
                    console.log(err)
                    return res.status(500).send({ message: err.message })
                })
            });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
}

// ChatGPT usage: No
// Adapted from: https://www.bezkoder.com/node-js-mongodb-auth-jwt/ 
exports.login = (req, res) => {
    try {
        User.findOne({
            username: req.body.username
        }).then(user => {
            if (!user || user.isBanned) {
                return res.status(404).send({
                    message: "User is not found or is banned"
                })
            }
    
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            )
            
            if (!passwordIsValid) {
                return res.status(401).send({ 
                    message: "Username or password is incorrect" 
                })
            }
    
            const jwtToken = jwt.sign(user._id.toString(), secretKey)
            return res.status(200).send({
                jwtToken,
                type: user.type
            })
        }).catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
}

// ChatGPT usage: No
async function verify(idToken, authCode) {
    const ticket = await OAuth2Client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID
    })
    const payload = ticket.getPayload()
    const googleId = payload['sub']

    return User.findOne({ googleId }).then(async user => {
        if (!user) {
            var newUser = new User({
                googleId,
                email: payload['email'],
                displayedName: payload['name']
            })

            const tokens = await getGoogleAccessTokens(authCode)
            if (tokens) {
                newUser.googleOauth = {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiryDate: tokens.expiry_date
                }
                newUser.useGoogleCalendar = true
            }

            return newUser.save().then(savedUser => {
                var ret = {
                    userId: savedUser._id.toString(),
                    newUser: true,
                    type: null,
                    isBanned: savedUser.isBanned
                }
                return Promise.resolve(ret)
            })
        } else {
            var ret = {
                userId: user._id.toString(),
                newUser: false,
                type: user.type,
                isBanned: user.isBanned
            }
            return Promise.resolve(ret)
        }
    }).catch(err => {
        return Promise.reject(err)
    })
}
