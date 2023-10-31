const controller = require("../controllers/appointment.controller")
const { authJwt, verifySignUp, account } = require("../middleware")
const db = require("../db")

const User = db.user

module.exports = function (app) {
    app.post(
        "/appointment/bookAppointment", 
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.bookAppointment
    )

    app.get(
        "/appointment",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.getAppointment
    )

    app.get(
        "/appointments",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.getUserAppointments
    )

    app.put(
        "/appointment/accept",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.acceptAppointment
    )

    app.put(
        "/appointment/cancel",
        authJwt.verifyJwt,
        account.verifyAccountStatus, 
        controller.cancelAppointment
    )
};
