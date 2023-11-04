const controller = require("../controllers/conversation.controller")
const { authJwt, account  } = require("../middleware")

module.exports = function (app) {
    app.get(
        "/conversation/get_list",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.getList
    );
    
    app.get(
        "/conversation/get_conversation",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.getConversation
    )

    app.post(
        "/conversation/create",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.create
    );
}