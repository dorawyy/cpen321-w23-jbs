
const { OAuth2Client } = require("google-auth-library")
const UserRole = require("./constants/user.roles")
const db = require("../models")

const client = new OAuth2Client()

// models
const Tutee = db.tutee



module.exports = function (app) {
    app.post('api/auth/google', (req, res) => {
        const {idToken} = req.body

    })
}

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    })
    const payload = ticket.getPayload()
    const userId = payload['sub']
    

}