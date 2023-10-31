const controller = require("../controllers/browse.controller")
const { authJwt, verifySignUp, account } = require("../middleware")

module.exports = function (app) {
    app.get(
        "/recommended",
        authJwt.verifyJwt,
        account.verifyAccountStatus,
        controller.recommended
    );
}