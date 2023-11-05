import * as controller from "../controllers/conversation.controller.js";
import middleware from "../middleware/index.js";

export default function (app) {
    app.get(
        "/conversation/get_list",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.getList
    );
    
    app.get(
        "/conversation/get_conversation",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.getConversation
    )

    app.post(
        "/conversation/create",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.create
    );
};