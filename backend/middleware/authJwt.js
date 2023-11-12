const jwt = require("jsonwebtoken")
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
            return next();
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