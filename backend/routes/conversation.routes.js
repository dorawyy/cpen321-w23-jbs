const controller = require("../controllers/conversation.controller")
const { authJwt, verifySignUp } = require("../middleware")

module.exports = function (app) {
    app.get(
        "/conversation/get_list",
        authJwt.verifyJwt,
        controller.getList
    );
    
    app.get(
        "/conversation/get_conversation",
        authJwt.verifyJwt,
        controller.getConversation
    )

    app.post(
        "/conversation/create",
        authJwt.verifyJwt,
        controller.create
    );
}