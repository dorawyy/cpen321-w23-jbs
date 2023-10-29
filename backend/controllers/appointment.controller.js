const { AppointmentStatus } = require("../constants/appointment.status");
const { UserType } = require("../constants/user.types");
const db = require("../db")
const { getCalendarEvents } = require("../utils/google.utils");
const momenttz = require("moment-timezone")

const User = db.user
const Appointment = db.appointment

exports.getUserAppointments = async (req, res) => {
    var userId = req.userId
    var courses = req.query.courses ? req.query.courses.split(',') : []
    var courseQuery = courses ? { course: { $in: courses } } : {};

    var user = await User
        .findById(userId)
        .then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "The other user is not found"
                })
            }
            return user
        })
        .catch(err => {
            console.log(err)
            return res.status(500).send({
                message: err.message
            })
        })
    
    var appointments = await cleanupUserAppointments(user)
    var appointmentIds = appointments.map(appt => appt._id)


    var filteredAppts = await Appointment
        .find(courseQuery)
        .where('_id')
        .in(appointmentIds)
        .catch(err => {
            console.log(err)
            return res.status(500).send({
                message: err.message
            })
        })

    return res.status(200).send(filteredAppts)
}

exports.getAppointment = async (req, res) => {
    var appointmentId = req.query.appointmentId
    Appointment.findById(appointmentId)
                .then(async appt => {
                    if (!appt) {
                        return res.status(404).send({
                            message: "Appointment not found."
                        })
                    }
                    var otherUserName = ""
                    for (user of appt.participantsInfo) {
                        if (user.userId != req.userId) {
                            otherUserName = await User
                                .findById(user.userId, "displayedName")
                                .then(user => {
                                    if (!user) {
                                        return res.status(404).send({
                                            message: "The other user is not found"
                                        })
                                    }
                                    return user.displayedName
                                })
                                .catch(err => {
                                    return res.status(500).send({
                                        message: err.message
                                    })
                                })
                        }
                    }
                    var ret = {
                        ...appt.toObject(),
                        otherUserName
                    }
                    return res.status(200).send(ret)
                })
                .catch(err => {
                    return res.status(500).send({
                        message: err.message
                    })
                })
}

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

    var tutee = await await User
        .findById(req.userId)
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

    req.body.pstStartDatetime = toPST(req.body.pstStartDatetime)
    req.body.pstEndDatetime = toPST(req.body.pstEndDatetime)

    var tutorIsAvailable = await isAvailable(tutor, req.body.pstStartDatetime, req.body.pstEndDatetime)
    var tuteeIsAvailable = await isAvailable(tutee, req.body.pstStartDatetime, req.body.pstEndDatetime)

    if (!tutorIsAvailable) {
        return res.status(400).send({ 
            message: "Tutor is unavailable during the specified time slot. "
        })
    }
    if (!tuteeIsAvailable) {
        return res.status(400).send({ 
            message: "You already have a pending/accepted appointment during the specified time slot. "
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
        ...req.body,
        
    }).save()
    .catch(err => {
        console.log(err)
        return res.status(500).send({ message: err.message })
    })

    var userNewAppt = {
        _id: newAppt._id,
        pstStartDatetime: req.body.pstStartDatetime,
        pstEndDatetime: req.body.pstEndDatetime
    }
    
    await User.findByIdAndUpdate(
        tutorId,
        { $push: {appointments: userNewAppt} }
    ).catch(err => {
        console.log(err)
        return res.status(500).send({ message: err.message })
    })

    await User.findByIdAndUpdate(
        req.userId,
        { $push: {appointments: userNewAppt} }
    ).catch(err => {
        console.log(err)
        return res.status(500).send({ message: err.message })
    })
    
    return res.status(200).send(newAppt)


}

async function isAvailable(user, pstStartDatetime, pstEndDatetime) {
    var isAvailable = false
    if (user.useGoogleCalendar) {
        isAvailable = await checkUserAvailabilityWithGoogleCalendar(
            user, pstStartDatetime, pstEndDatetime
        )
    } else {
        isAvailable = await checkUserManualAvailability(
            user, pstStartDatetime, pstEndDatetime
        )
    }
    return isAvailable
}

async function checkUserManualAvailability( 
    user, pstStartDatetime, pstEndDatetime
) {
    if (user.type === UserType.TUTOR) {
        var requestedDay = momenttz(pstStartDatetime).format("dddd")
        var requestedStartTime = momenttz(
            momenttz(pstStartDatetime).format("HH:mm"),
            "HH:mm"
        )
        var requestedEndTime = momenttz(
            momenttz(pstEndDatetime).format("HH:mm"),
            "HH:mm"
        )

        var availabilities = user.manualAvailability.filter(avail => {
            var availStart = momenttz(avail.startTime, "HH:mm")
            var availEnd = momenttz(avail.endTime, "HH:mm")

            return avail.day === requestedDay
                && availStart.isSameOrBefore(requestedStartTime)
                && availEnd.isSameOrAfter(requestedEndTime)
        })
        if (availabilities.length == 0) {
            return false
        }
    }
    if (user.appointments.length == 0) {
        return true
    }

    var upcomingAppointments = await cleanupUserAppointments(user)
    if (upcomingAppointments.length == 0) {
        return true
    }
    
    // TUTEE: a pending appointment is considered unavailable for the tutee
    // TUTOR: a pending appointment is considered available for the tutor
    var acceptedAppointments = upcomingAppointments
    if (user.type === UserType.TUTOR) {
        acceptedAppointments = await getAcceptedAppointments(upcomingAppointments)
    }
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


async function checkUserAvailabilityWithGoogleCalendar(
    user, pstStartDatetime, pstEndDatetime
) {
    const events = await getCalendarEvents(
        user, pstStartDatetime, pstEndDatetime
    )
   
    return events.length === 0;
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

// chatgpt
function toPST(dateString) {
    return momenttz(dateString).tz('America/Los_Angeles').format();
}

module.exports.appointmentIsCompleted = appointmentIsCompleted
module.exports.appointmentIsAccepted = appointmentIsAccepted