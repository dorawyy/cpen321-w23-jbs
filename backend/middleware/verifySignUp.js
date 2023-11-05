const db = require("../db")
const User = db.user

// ChatGPT usage: No
// Source: https://www.bezkoder.com/node-js-mongodb-auth-jwt/ 
function checkDuplicateUsernameOrEmail(req, res, next) {
    try {
        var token = req.header('Authorization')
        if (token) {
            return next()
        }
        User.findOne({
            username: req.body.username
        }).then(user => {
            if (user) {
                return res.status(400).send({ 
                    message: "Username already exists."
                })
            }
    
            User.findOne({
                email: req.body.email
            }).then(user => {
                if (user) {
                    return res.status(400).send({ 
                        message: "Email already exists."
                    })
                }
                return next()
            })
        })
        
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err })
    }
}

const verifySignUp = {
    checkDuplicateUsernameOrEmail
}

module.exports = verifySignUp