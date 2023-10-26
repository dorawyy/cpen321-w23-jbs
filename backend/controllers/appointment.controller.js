const db = require("../db")

const User = db.user
const Appointment = db.appointment

exports.appointmentIsCompleted = async (appointmentId) => {
    return Appointment
        .findById(appointmentId, "pstEndDatetime")
        .then(appt => {
            var pstNow = new Date().toLocaleString("en-US", {
                timeZone: "America/Los_Angeles"
            })
            
            if (pstEndDatetime > pstNow) {
                return Promise.resolve(false)
            } else {
                return Promise.resolve(true)
            }
        })        
}

