const profileController = require("../controllers/profile.controller")
const apptController = require("../controllers/appointment.controller")
const { authJwt, verifySignUp } = require("../middleware")
const db = require("../db")

const User = db.user

module.exports = function (app) {
    app.get("/user/publicProfile", profileController.getPublicProfile)

    app.get(
        "/user/profile", 
        authJwt.verifyJwt, 
        profileController.getPrivateProfile
    )

    app.put(
        "/user/editProfile", 
        authJwt.verifyJwt, 
        profileController.editProfile
    )

    app.get(
        "/user/availability",
        apptController.getTutorAvailability
    )
};
