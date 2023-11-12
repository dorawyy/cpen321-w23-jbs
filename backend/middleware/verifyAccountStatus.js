const db = require("../db")
const User = db.user

// ChatGPT usage: No
async function verifyAccountStatus(req, res, next) {
    var userId = req.userId
    User.findById(userId)
        .then(user => {
            if (!user || user.isBanned) {
                return res.status(403).send({ 
                    message: "User is not found or banned"
                }); // Forbidden 
            }
            return next()
        }).catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
        })
}

const account = {
    verifyAccountStatus
}

module.exports = account