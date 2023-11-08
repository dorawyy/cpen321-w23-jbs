const profileController = require("../controllers/profile.controller")
const apptController = require("../controllers/appointment.controller")
const courseController = require("../controllers/courses.controller")
const { authJwt, account } = require("../middleware")

module.exports = function (app) {
    app.get("/user/publicProfile", profileController.getPublicProfile)

    app.get(
        "/user/profile", 
        authJwt.verifyJwt, 
        account.verifyAccountStatus,  
        profileController.getPrivateProfile
    )

    app.put(
        "/user/editProfile", 
        authJwt.verifyJwt, 
        account.verifyAccountStatus,  
        profileController.editProfile
    )

    app.get(
        "/user/availability",
        apptController.getTutorAvailability
    )

    app.get(
        "/courses",
        courseController.getCourseCodes
    )
};
