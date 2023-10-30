const { AppointmentStatus } = require("../constants/appointment.status");
const { UserType } = require("../constants/user.types");
const db = require("../db")
const googleUtils = require("../utils/google.utils");
const momenttz = require("moment-timezone")

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
exports.cleanupUserAppointments = async (user) => {
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
    if (busyTimes.length == 0) {
        return [{
            start: timeMin,
            end: timeMax
        }]
    }
    var freeTimes = []

    // Include free time before the first busy period
    const firstBusyStart = momenttz(busyTimes[0].pstStartDatetime)
    .tz('America/Los_Angeles');
    const startDateTime = momenttz(timeMin).tz('America/Los_Angeles')

    if (firstBusyStart.isSameOrAfter(startDateTime)) {
        const freeStart = startDateTime;
        const freeEnd = firstBusyStart;
        const diff = momenttz.duration(freeEnd.diff(freeStart))
        if (diff.hours() >= 1) {
            freeTimes.push({ 
                start: freeStart.toISOString(true),
                end: freeEnd.toISOString(true) 
            });
        }
    }

    // Infer free times based on busy intervals
    for (let i = 0; i < busyTimes.length - 1; i++) {
        const busyEnd = momenttz(busyTimes[i].pstEndDatetime)
                        .tz('America/Los_Angeles');
        if (i + 1 < busyTimes.length) {
            var nextBusyStart = momenttz(busyTimes[i + 1].pstStartDatetime)
                                .tz('America/Los_Angeles');
        } else {
            var nextBusyStart = momenttz(busyTimes[i].pstEndDatetime)
                                .tz('America/Los_Angeles')
        }
        
        const freeStart = busyEnd.toISOString(true);
        const freeEnd = nextBusyStart.toISOString(true);
        freeTimes.push({ start: freeStart, end: freeEnd });
    }

     // Include free time after the last busy period
    const lastBusyEnd = momenttz(
        busyTimes[busyTimes.length - 1].pstEndDatetime
    ).tz('America/Los_Angeles');
    const endDateTime = momenttz(timeMax).tz('America/Los_Angeles')

    if (lastBusyEnd.isSameOrBefore(endDateTime)) {
        const freeStart = lastBusyEnd;
        const freeEnd = endDateTime;
        const diff = momenttz.duration(freeEnd.diff(freeStart))
        if (diff.hours() >= 1) {
            freeTimes.push({ 
                start: freeStart.toISOString(true),
                end: freeEnd.toISOString(true) 
            });
        }
    }
    return freeTimes
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
    const events = await googleUtils.getCalendarEvents(
        user, pstStartDatetime, pstEndDatetime
    )
    return events.length === 0;
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

// chatgpt
function toPST(dateString) {
    return momenttz(dateString).tz('America/Los_Angeles').format();
}


module.exports.appointmentIsCompleted = appointmentIsCompleted
module.exports.appointmentIsAccepted = appointmentIsAccepted
module.exports.getAppointmentStatus = getAppointmentStatus
module.exports.toPST = toPST