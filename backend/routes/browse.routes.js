import * as controller from "../controllers/browse.controller.js";
import middleware from "../middleware/index.js";

export default function (app) {
    app.get(
        "/recommended",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus,
        controller.recommended
    );
};