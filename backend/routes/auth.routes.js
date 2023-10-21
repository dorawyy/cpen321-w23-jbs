const controller = require("../controllers/auth.controller")
const { authJwt } = require("../middleware")
const db = require("../db")

const User = db.user

module.exports = function (app) {
    // authenticate through google
    app.post("/api/auth/google", controller.googleAuth);
    
};
