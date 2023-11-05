const controller = require("../controllers/admin.controller")
const { authJwt } = require("../middleware")

module.exports = function (app) {
    app.put(
        "/admin/ban",
        authJwt.verifyJwt,
        controller.ban
    );

    app.put(
        "/admin/unban",
        authJwt.verifyJwt,
        controller.unban
    );

    app.get(
        "/admin/users",
        authJwt.verifyJwt,
        controller.getUsers
    );

    app.get(
        "/admin/profile",
        authJwt.verifyJwt,
        controller.getProfile
    );
}