const controller = require("../controllers/recommendation.controller")
const { authJwt, verifySignUp, account } = require("../middleware")

module.exports = function (app) {
    app.post(
        "/user_action/checked_profile",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.checkedProfile
    );
    
    app.post(
        "/user_action/contacted_tutor",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.contactedTutor
    );
    
    app.post(
        "/user_action/scheduled_appointment",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.scheduledAppointment
    );
    
    app.post(
        "/user_action/reviewed_tutor",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.reviewedTutor
    );
}