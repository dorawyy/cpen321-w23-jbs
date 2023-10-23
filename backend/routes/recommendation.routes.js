const controller = require("../controllers/recommendation.controller")
const { authJwt, verifySignUp } = require("../middleware")

module.exports = function (app) {
    app.post(
        "/user_action/checked_profile",
        authJwt.verifyJwt,
        controller.checkedProfile
    );
    
    app.post(
        "/user_action/contacted_tutor",
        authJwt.verifyJwt,
        controller.contactedTutor
    );
    
    app.post(
        "/user_action/scheduled_appointment",
        authJwt.verifyJwt,
        controller.scheduledAppointment
    );
    
    app.post(
        "/user_action/reviewed_tutor",
        authJwt.verifyJwt,
        controller.reviewedTutor
    );
}