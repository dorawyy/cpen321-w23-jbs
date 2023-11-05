import * as controller from "../controllers/admin.controller.js";
import middleware from "../middleware/index.js";

export default function (app) {
    app.put(
        "/admin/ban",
        middleware.authJwt.verifyJwt,
        controller.ban
    );

    app.put(
        "/admin/unban",
        middleware.authJwt.verifyJwt,
        controller.unban
    );

    app.get(
        "/admin/users",
        middleware.authJwt.verifyJwt,
        controller.getUsers
    );

    app.get(
        "/admin/profile",
        middleware.authJwt.verifyJwt,
        controller.getProfile
    );
};