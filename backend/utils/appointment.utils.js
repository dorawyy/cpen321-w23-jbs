const { AppointmentStatus } = require("../constants/appointment.status");
const { UserType } = require("../constants/user.types");
const db = require("../db")
const googleUtils = require("../utils/google.utils");
const momenttz = require("moment-timezone");
const { getFreeTimeHelper } = require("./freetimes.utils");

const User = db.user
const Appointment = db.appointment

exports.isAvailable = async (user, pstStartDatetime, pstEndDatetime) => {
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

// remove completed appointments. upcomingAppointments includes
// pending/accepted appointments
async function cleanupUserAppointments(user) {
    var upcomingAppointments = []
    if (user.appointments) {
        for (appt of user.appointments) {
            var status = await getAppointmentStatus(appt._id)
            var isCompleted = await appointmentIsCompleted(appt._id)

            if (!isCompleted && status !== AppointmentStatus.CANCELED) {
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

exports.getManualFreeTimes = async (user, timeMin, timeMax) => {
    var upcomingAppointments = await cleanupUserAppointments(user)
    var acceptedAppointments = await getAcceptedAppointments(
        upcomingAppointments
    )
    var busyTimes = []
    timeMin = momenttz(timeMin).tz('America/Los_Angeles')
    timeMax = momenttz(timeMax).tz('America/Los_Angeles')
    for (appt of acceptedAppointments) {
        var apptStart = momenttz(appt.pstStartDatetime).tz('America/Los_Angeles');
        var apptEnd = momenttz(appt.pstEndDatetime).tz('America/Los_Angeles')
        if (apptStart.isSameOrAfter(timeMin) && 
            apptEnd.isSameOrBefore(timeMax)) {
            busyTimes.push(appt)
        }
    }
    return getFreeTimeHelper(
        timeMin.toISOString(true), 
        timeMax.toISOString(true), 
        busyTimes, false
    )
}


async function checkUserManualAvailability( 
    user, pstStartDatetime, pstEndDatetime
) {
    if (user.manualAvailability && user.type === UserType.TUTOR) {
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
            var newAppt = {
                pstStartDatetime,
                pstEndDatetime
            }
            return isConflicted(appt, newAppt)
            
        } 
    )
    return conflicts.length === 0
}

function isConflicted(appt1, appt2) {
    var appt1Start = momenttz(appt1.pstStartDatetime)
    var appt1End = momenttz(appt1.pstEndDatetime)

    var appt2Start = momenttz(appt2.pstStartDatetime)
    var appt2End = momenttz(appt2.pstEndDatetime)

    if (appt1End.isSameOrBefore(appt2Start) ||
        appt1Start.isSameOrAfter(appt2End)) {
            return false
    }
    return true
}


async function checkUserAvailabilityWithGoogleCalendar(
    user, pstStartDatetime, pstEndDatetime
) {
    const events = await googleUtils.getCalendarEvents(
        user, pstStartDatetime, pstEndDatetime
    )
    var upcomingAppointments = await cleanupUserAppointments(user)
    var conflicts = upcomingAppointments.filter(
        appt => {
            var newAppt = {
                pstStartDatetime,
                pstEndDatetime
            }
            return isConflicted(appt, newAppt)
        } 
    )
    return events.length === 0 && conflicts.length === 0;
}

async function appointmentIsCompleted (appointmentId) {
    return Appointment
        .findById(appointmentId, "pstEndDatetime")
        .then(appt => {
            var pstNow = momenttz(new Date().toISOString(true))
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

async function getAppointmentStatus(appointmentId) {
    var status = await Appointment
        .findById(appointmentId, "status")
        .then(appt => { 
            return appt.status
        })
    return status
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

// ChatGPT usage: Yes
function toPST(dateString) {
    return momenttz(dateString).tz('America/Los_Angeles').format();
}


module.exports.appointmentIsCompleted = appointmentIsCompleted
module.exports.appointmentIsAccepted = appointmentIsAccepted
module.exports.getAppointmentStatus = getAppointmentStatus
module.exports.toPST = toPST
module.exports.cleanupUserAppointments = cleanupUserAppointments
module.exports.isConflicted = isConflicted