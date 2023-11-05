import * as controller from "../controllers/recommendation.controller.js";
import middleware from "../middleware/index.js";

export default function (app) {
    app.post(
        "/user_action/checked_profile",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.checkedProfile
    );
    
    app.post(
        "/user_action/contacted_tutor",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.contactedTutor
    );
    
    app.post(
        "/user_action/scheduled_appointment",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus,  
        controller.scheduledAppointment
    );
    
    app.post(
        "/user_action/reviewed_tutor",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.reviewedTutor
    );
};