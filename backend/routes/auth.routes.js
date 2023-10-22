const controller = require("../controllers/auth.controller")
const { authJwt, verifySignUp } = require("../middleware")
const db = require("../db")

const User = db.user

module.exports = function (app) {
    // authenticate through google
    app.post("/api/auth/google", controller.googleAuth);
    app.post(
        "/api/auth/signup", 
        verifySignUp.checkDuplicateUsernameOrEmail, 
        controller.signup
    )
    app.post("/api/auth/login", controller.login)
};
