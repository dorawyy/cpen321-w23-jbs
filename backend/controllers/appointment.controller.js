const { AppointmentStatus } = require("../constants/appointment.status");
const db = require("../db")
const { getCalendarEvents } = require("../utils/google.utils");
const momenttz = require("moment-timezone")

const User = db.user
const Appointment = db.appointment


exports.bookAppointment = async (req, res) => {
    const tutorId = req.body.tutorId
    var tutor = await User
        .findById(tutorId)
        .then(user => {
            if (!user) {
                return res.status(400).send({ message: "User not found." })
            }
            return user
        })
        .catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
        })

    const pstStartDatetime = toPST(req.body.pstStartDatetime)
    const pstEndDatetime = toPST(req.body.pstEndDatetime)

    var isAvailable = false
    if (tutor.useGoogleCalendar) {
        isAvailable = await checkTutorAvailabilityWithGoogleCalendar(
            tutor, pstStartDatetime, pstEndDatetime
        )
    } else {
        isAvailable = await checkTutorManualAvailability(
            tutor, pstStartDatetime, pstEndDatetime
        )
    }

    if (!isAvailable) {
        return res.status(400).send({ 
            message: "Tutor is unavailable during the specified time slot. "
        })
    }

    var newAppt = await new Appointment({
        status: AppointmentStatus.PENDING,
        participantsInfo: [
            {
                userId: tutorId
            },
            {
                userId: req.userId // tutee
            }
        ],
        pstStartDatetime,
        pstEndDatetime,
        location: req.body.location,
        notes: req.body.notes
    }).save()
    .catch(err => {
        console.log(err)
        return res.status(500).send({ message: err.message })
    })

    var userNewAppt = {
        _id: newAppt._id,
        pstStartDatetime,
        pstEndDatetime
    }
    
    await User.findByIdAndUpdate(
        tutorId,
        { $push: {appointments: userNewAppt} }
    ).catch(err => {
        console.log(err)
        return res.status(500).send({ message: err.message })
    })


    var tutee = await User.findById(req.userId)
                    .then(user => {
                        if (!user) {
                            return res.status(400).send({ message: "User not found." })
                        }
                        return user
                    })
                    .catch(err => {
                        console.log(err)
                        return res.status(500).send({ message: err.message })
                    })

    await cleanupUserAppointments(tutee)

    await User.findByIdAndUpdate(
        req.userId,
        { $push: {appointments: userNewAppt} }
    ).catch(err => {
        console.log(err)
        return res.status(500).send({ message: err.message })
    })
    
    return res.status(200).send(newAppt)


}

async function checkTutorManualAvailability( 
    tutor, pstStartDatetime, pstEndDatetime
) {
    if (tutor.appointments.length == 0) {
        return true
    }

    var upcomingAppointments = await cleanupUserAppointments(tutor)
    if (upcomingAppointments.length == 0) {
        return true
    }

    var acceptedAppointments = await getAcceptedAppointments(upcomingAppointments)
    if (acceptedAppointments.length == 0) {
        return true
    }
    
    var conflicts = acceptedAppointments.filter(
        appt => {
            var newPstStart = momenttz(pstStartDatetime)
            var newPstEnd = momenttz(pstEndDatetime)
            var apptPstStart = momenttz(appt.pstStartDatetime)
            var apptPstEnd = momenttz(appt.pstEndDatetime)

            if (newPstEnd.isSameOrBefore(apptPstStart) ||
                newPstStart.isSameOrAfter(apptPstEnd)) {
                    return false
            } else {
                return true
            }
        } 
    )
    return conflicts.length === 0

}



async function appointmentIsCompleted (appointmentId) {
    return Appointment
        .findById(appointmentId, "pstEndDatetime")
        .then(appt => {
            var pstNow = momenttz(new Date().toISOString())
                            .tz('America/Los_Angeles')
            
            if (momenttz(appt.pstEndDatetime).isAfter(pstNow)) {
                return Promise.resolve(false)
            } else {
                return Promise.resolve(true)
            }
        })        
}

async function appointmentIsAccepted(appointmentId) {
    var isAccepted = await Appointment
        .findById(appointmentId, "status")
        .then(appt => { 
            return appt.status === AppointmentStatus.ACCEPTED 
        })
    
    return isAccepted
}

// remove completed appointments. upcomingAppointments includes
// pending/accepted appointments
async function cleanupUserAppointments(user) {
    var upcomingAppointments = []
    if (user.appointments) {
        for (appt of user.appointments) {
            var isCompleted = await appointmentIsCompleted(appt._id)
            if (!isCompleted) {
                upcomingAppointments.push(appt)
            }
        }
    }

    return await 
        User.findByIdAndUpdate(
            user._id, { appointments: upcomingAppointments },
            {new: true}
        ).then(user => {
            return user.appointments
        })
}

async function getAcceptedAppointments(appointments) {
    var acceptedAppointments = []
    for (appt of appointments) {
        var isAccepted = await appointmentIsAccepted(appt._id)
        if (isAccepted) {
            acceptedAppointments.push(appt)
        }
    }
    return acceptedAppointments
}


async function checkTutorAvailabilityWithGoogleCalendar(
    tutorUser, pstStartDatetime, pstEndDatetime
) {
    const events = await getCalendarEvents(
        tutorUser, pstStartDatetime, pstEndDatetime
    )
   
    return events.length === 0;
}

// chatgpt
function toPST(dateString) {
    return momenttz(dateString).tz('America/Los_Angeles').format();
}

module.exports.appointmentIsCompleted = appointmentIsCompleted
module.exports.appointmentIsAccepted = appointmentIsAccepted