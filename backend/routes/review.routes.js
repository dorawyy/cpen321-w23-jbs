const controller = require("../controllers/review.controller")
const { authJwt, verifySignUp, account  } = require("../middleware")
const db = require("../db")

const User = db.user

module.exports = function (app) {
    app.post(
        "/review/addReview", 
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.addReview
    )

    app.get("/review", controller.getUserReviews)
};
