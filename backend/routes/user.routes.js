import * as profileController from "../controllers/profile.controller.js";
import * as apptController from "../controllers/appointment.controller.js";
import * as courseController from "../controllers/courses.controller.js";
import middleware from "../middleware/index.js";

export default function (app) {
    app.get("/user/publicProfile", profileController.getPublicProfile)

    app.get(
        "/user/profile", 
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        profileController.getPrivateProfile
    )

    app.put(
        "/user/editProfile", 
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
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
