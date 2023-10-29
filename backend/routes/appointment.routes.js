const controller = require("../controllers/appointment.controller")
const { authJwt, verifySignUp } = require("../middleware")
const db = require("../db")

const User = db.user

module.exports = function (app) {
    app.post(
        "/appointment/bookAppointment", 
        authJwt.verifyJwt, 
        controller.bookAppointment
    )

    app.get(
        "/appointment",
        authJwt.verifyJwt,
        controller.getAppointment
    )

    app.get(
        "/appointments",
        authJwt.verifyJwt,
        controller.getUserAppointments
    )
};
