const controller = require("../controllers/review.controller")
const { authJwt, verifySignUp } = require("../middleware")
const db = require("../db")

const User = db.user

module.exports = function (app) {
    app.post("/review/addReview", authJwt.verifyJwt, controller.addReview)
};
