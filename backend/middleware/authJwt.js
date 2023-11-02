const jwt = require("jsonwebtoken")
const db = require("../db")
const User = db.user

const secretKey = process.env.SECRET_KEY

// ChatGPT usage: No
function verifyJwt(req, res, next) {
    try {
        var token = req.header('Authorization')

        if (!token) {
            return res.status(403).send({ message: "No token provided"})
        }
        
        token = token.replace("Bearer ", "")
        jwt.verify(token, secretKey, (err, userId) => {
            if (err) {
                console.log(err)
                return res.status(403).send({ message: "Failed to verify JWT"}); // Forbidden
            }
            req.userId = userId; 
            next();
            return
        });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
}

const authJwt = {
    verifyJwt
}

module.exports = authJwt