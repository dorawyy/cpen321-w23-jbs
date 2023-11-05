import * as controller from "../controllers/appointment.controller.js";
import middleware from "../middleware/index.js";

export default function (app) {
    app.post(
        "/appointment/bookAppointment", 
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.bookAppointment
    )

    app.get(
        "/appointment",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.getAppointment
    )

    app.get(
        "/appointments",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.getUserAppointments
    )

    app.put(
        "/appointment/accept",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.acceptAppointment
    )

    app.put(
        "/appointment/cancel",
        middleware.authJwt.verifyJwt,
        middleware.account.verifyAccountStatus, 
        controller.cancelAppointment
    )
};
