const controller = require("../controllers/review.controller")
const { authJwt, account  } = require("../middleware")

module.exports = function (app) {
    app.post(
        "/review/addReview", 
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.addReview
    )

    app.get("/review", controller.getUserReviews)
};
