const db = require("../db")
const User = db.user

// Source: https://www.bezkoder.com/node-js-mongodb-auth-jwt/ 
function checkDuplicateUsernameOrEmail(req, res, next) {
    User.findOne({
        username: req.body.username
    }).then(user => {
        if (user) {
            res.status(400).send({ message: "Username already exists."})
            return
        }

        User.findOne({
            email: req.body.email
        }).then(user => {
            if (user) {
                res.status(400).send({ message: "Email already exists."})
                return
            }
            next()
        })
        .catch(err => {
            res.status(500).send({ message: err })
            return
        })
    })
    .catch(err => {
        res.status(500).send({ message: err })
        return
    })
}

const verifySignUp = {
    checkDuplicateUsernameOrEmail
}

module.exports = verifySignUp