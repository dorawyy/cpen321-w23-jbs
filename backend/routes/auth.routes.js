const controller = require("../controllers/auth.controller")
const { verifySignUp } = require("../middleware")

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
