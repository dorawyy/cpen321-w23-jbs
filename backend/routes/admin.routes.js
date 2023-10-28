const controller = require("../controllers/admin.controller")
const { authJwt, verifySignUp } = require("../middleware")

module.exports = function (app) {
    app.post(
        "/admin/ban",
        authJwt.verifyJwt,
        controller.ban
    );

    app.post(
        "/admin/unban",
        authJwt.verifyJwt,
        controller.unban
    );

    // app.post(
    //     "/admin/users",
    //     authJwt.verifyJwt,
    //     controller.getUsers
    // );
}