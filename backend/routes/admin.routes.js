const controller = require("../controllers/admin.controller")
const { authJwt, account } = require("../middleware")

module.exports = function (app) {
    app.put(
        "/admin/ban",
        authJwt.verifyJwt,
        account.verifyAccountStatus,
        controller.ban
    );

    app.put(
        "/admin/unban",
        authJwt.verifyJwt,
        account.verifyAccountStatus,
        controller.unban
    );

    app.get(
        "/admin/users",
        authJwt.verifyJwt,
        account.verifyAccountStatus,
        controller.getUsers
    );

    app.get(
        "/admin/profile",
        authJwt.verifyJwt,
        account.verifyAccountStatus,
        controller.getProfile
    );
}