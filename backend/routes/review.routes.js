import * as controller from "../controllers/review.controller.js";
import middleware from "../middleware/index.js";

export default function (app) {
    app.post(
        "/review/addReview", 
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.addReview
    )

    app.get("/review", controller.getUserReviews)
};
