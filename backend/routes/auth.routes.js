import * as controller from "../controllers/auth.controller.js";
import middleware from "../middleware/index.js";

export default function (app) {
    // authenticate through google
    app.post("/api/auth/google", controller.googleAuth);
    app.post(
        "/api/auth/signup", 
        middleware.verifySignUp.checkDuplicateUsernameOrEmail, 
        controller.signup
    )
    app.post("/api/auth/login", controller.login)
};
