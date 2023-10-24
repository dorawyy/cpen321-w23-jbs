const controller = require("../controllers/browse.controller")
const { authJwt, verifySignUp } = require("../middleware")

module.exports = function (app) {
    app.get(
        "/recommended",
        authJwt.verifyJwt,
        controller.recommended
    );
}