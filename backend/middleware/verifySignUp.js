const db = require("../db")
const User = db.user

// Source: https://www.bezkoder.com/node-js-mongodb-auth-jwt/ 
function checkDuplicateUsernameOrEmail(req, res, next) {
    try {
        var token = req.header('Authorization')
        if (token) {
            next()
            return
        }
        User.findOne({
            username: req.body.username
        }).then(user => {
            if (user) {
                return res.status(400).send({ message: "Username already exists."})
            }
    
            User.findOne({
                email: req.body.email
            }).then(user => {
                if (user) {
                    return res.status(400).send({ message: "Email already exists."})
                }
                next()
                return
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