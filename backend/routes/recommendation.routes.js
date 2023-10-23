const controller = require("../controllers/recommendation.controller")
const { authJwt, verifySignUp } = require("../middleware")

module.exports = function (app) {
    app.post("/user_action/checked_profile",
        authJwt.verifyJwt,
        controller.checkedProfile);
};

module.exports = function (app) {
    app.post("/user_action/contacted_tutor",
        authJwt.verifyJwt,
        controller.contactedTutor);
};

module.exports = function (app) {
    app.post("/user_action/scheduled_appointment",
        authJwt.verifyJwt,
        controller.scheduledAppointment);
};

module.exports = function (app) {
    app.post("/user_action/reviewed_tutor",
        authJwt.verifyJwt,
        controller.reviewedTutor);
};