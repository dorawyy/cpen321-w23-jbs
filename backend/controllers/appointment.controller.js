const { AppointmentStatus } = require("../constants/appointment.status");
const { UserType } = require("../constants/user.types");
const db = require("../db")
const { getCalendarEvents, getFreeTime, createGoogleEvent, cancelGoogleEvent } = require("../utils/google.utils");
const momenttz = require("moment-timezone")
const mongoose = require("mongoose")

const User = db.user
const Appointment = db.appointment

exports.cancelAppointment = async (req, res) => {
    try {
        var userId = req.userId
        var apptId = req.query.appointmentId
        var user = await User.findById(userId)
        if (!user || user.isBanned) {
            return res.status(400).send({
                message: "User not found"
            })
        }
        var upcomingAppointments = await cleanupUserAppointments(user)
    
        if (!apptId) {
            return res.status(400).send({
                message: "appointmentId is required"
            })
        }
        var usersApptIds = upcomingAppointments.map(appt => appt._id)
        var idStrings = usersApptIds.map(id => id.toString())
    
        if (!(idStrings.includes(apptId))) {
            return res.status(404).send({
                message: "Appointment not found"
            })
        }
    
        var canceledAppt = await Appointment.findByIdAndUpdate(
            apptId, {status: AppointmentStatus.CANCELED},
            { new: true }
        )

        if (!canceledAppt) {
            return res.status(404).send({
                message: "Appointment not found"
            })
        }
    
        user = await User.findById(userId)
            
        if (!user || user.isBanned) {
            return res.status(400).send({
                message: "User not found"
            })
        }
    
        var otherUserId = canceledAppt.participantsInfo
            .filter(user => user.userId != userId)[0].userId
        
        var otherUser = await User.findById(otherUserId)    
        if (!otherUser || otherUser.isBanned) {
            return res.status(400).send({ message: "User not found" })
        }
        
        if (user.useGoogleCalendar) {
            await cancelGoogleEvent(user, otherUser, canceledAppt)
        }
        if (otherUser.useGoogleCalendar) {
            await cancelGoogleEvent(otherUser, user, canceledAppt)
        }
    
        await cleanupUserAppointments(user)
        
        await cleanupUserAppointments(otherUser)
            .then(result => {
                return res.status(200).send({
                    message: "Canceled appointment successfully"
                })
            })
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            message: err.message
        })
    }
    
    
}

exports.getTutorAvailability = async (req, res) => {
    try {
        var tutorId = req.query.userId
        var date = req.query.date
        if (!tutorId || !date) {
            return res.status(400).send({ 
                message: "userId and date are required."
            })
        }
        var tutor = await User.findById(tutorId)
        if (!tutor || tutor.isBanned) {
            return res.status(400).send({ message: "User not found" })
        }
            
        var timeMin = momenttz(date)
            .tz('America/Los_Angeles')
            .startOf('day')
            .toISOString(true)
    
        var timeMax = momenttz(date)
            .tz('America/Los_Angeles')
            .endOf('day')
            .toISOString(true)
    
        if (tutor.useGoogleCalendar) {
            var freeTimes = await getFreeTime(
                tutor, timeMin, timeMax
            )
            return res.status(200).send(freeTimes)
        } else {
            if (tutor.manualAvailability) {
                var requestedDay = momenttz(date).format("dddd")
                var dayAvailabilities = tutor.manualAvailability.filter(avail => {
                    return avail.day === requestedDay 
                })
                var availabilities = []
                var tzOffset = momenttz()
                    .tz('America/Los_Angeles')
                    .format('Z')
                for (block of dayAvailabilities) {            
                    var start = momenttz(`${date}T${block.startTime}:00${tzOffset}`)
                        .tz('America/Los_Angeles')
                        .toISOString(true)
                    var end = momenttz(`${date}T${block.endTime}:00${tzOffset}`)
                        .tz('America/Los_Angeles')
                        .toISOString(true)
                    var freeTimes = await getManualFreeTimes(
                        tutor, start, end
                    )
                    availabilities = availabilities.concat(freeTimes)
                }
                return res.status(200).send(availabilities)
            } else {
                var freeTimes = [{
                    start: "00:00",
                    end: "23:59"
                }]
                return res.status(200).send(freeTimes)
            }
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
        
}

exports.acceptAppointment = async (req, res) => {
    try {
        var userId = req.userId
        var user = await User.findById(userId)
        if (!user || user.isBanned) {
            return res.status(400).send({ message: "User not found" })
        }
            
        if (user.type === UserType.TUTEE) {
            return res.status(403).send({ 
                message: "Only tutors are allowed to accept appointments." 
            })
        }
        var upcomingAppointments = await cleanupUserAppointments(user)
    
        var apptId = req.query.appointmentId
        if (!apptId) {
            return res.status(400).send({
                message: "appointmentId is required"
            })
        }
        var usersApptIds = upcomingAppointments.map(appt => appt._id)
        var idStrings = usersApptIds.map(id => id.toString())
    
        if (!(idStrings.includes(apptId))) {
            return res.status(404).send({
                message: "Appointment not found"
            })
        }
    
        var acceptedAppt = await Appointment.findByIdAndUpdate(
            apptId, {status: AppointmentStatus.ACCEPTED},
            { new: true }
        )
        if (!acceptedAppt) {
            return res.status(404).send({
                message: "Appointment not found"
            }) 
        }
    
        await Appointment.updateMany(
            {
                _id: {
                    $in: usersApptIds,
                    $ne: apptId
                },
                status: AppointmentStatus.PENDING
            },
            { $set: { status: AppointmentStatus.CANCELED} },
        )
    
        var tutor = await User.findById(userId)
        if (!tutor || tutor.isBanned) {
            return res.status(400).send({ message: "User not found" })
        }
    
        var tuteeId = acceptedAppt.participantsInfo
            .filter(user => user.userId != userId)[0].userId
        
        var tutee = await User.findById(tuteeId)
        if (!tutee || tutee.isBanned) {
            return res.status(400).send({ message: "User not found" })
        }
    
        if (tutor.useGoogleCalendar) {
            await createGoogleEvent(tutor, tutee, acceptedAppt)
        }
        if (tutee.useGoogleCalendar) {
            await createGoogleEvent(tutee, tutor, acceptedAppt)
        }
        
        await cleanupUserAppointments(tutor).then(result => {
            return res.status(200).send({
                message: "Accepted appointment successfully"
            })
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            message: err.message
        })
    }
}

// ChatGPT usage: Partial
exports.getUserAppointments = async (req, res) => {
    try {
        var userId = req.userId
        var courses = req.query.courses ? req.query.courses.split(',') : []    
        var user = await User.findById(userId)
            
        if (!user || user.isBanned) {
            return res.status(404).send({
                message: "The other user is not found"
            })
        }
        
        var appointments = await cleanupUserAppointments(user)
        var appointmentIds = appointments.map(appt => appt._id)

        var query =  {
            _id: {
                $in: appointmentIds
            }
        }
        if (courses.length > 0) {
            query.course = {
                $in: courses
            }
        }
    
        var filteredAppts = await Appointment
            .find({
                ...query,
            })
    
        return res.status(200).send(filteredAppts)
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            message: err.message
        })
    }
    
}

exports.getAppointment = async (req, res) => {
    try {
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
                                otherUserName = user.displayedName
                            }
                        }
                        var ret = {
                            ...appt.toObject(),
                            otherUserName
                        }
                        return res.status(200).send(ret)
                    })
    } catch (err) {
        return res.status(500).send({
            message: err.message
        })
    }
}

exports.bookAppointment = async (req, res) => {
    try {
        const tutorId = req.body.tutorId
        var tutor = await User.findById(tutorId)
        if (!tutor || tutor.isBanned) {
            return res.status(400).send({ message: "User not found." })
        }
    
        var tutee = await User.findById(req.userId)
        if (!tutee || tutee.isBanned) {
            return res.status(400).send({ message: "User not found." })
        }
    
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
                    userId: tutorId,
                    displayedName: tutor.displayedName
                },
                {
                    userId: req.userId, // tutee
                    displayedName: tutee.displayedName
                }
            ],
            ...req.body,
            
        }).save()
    
        var userNewAppt = {
            _id: newAppt._id,
            pstStartDatetime: req.body.pstStartDatetime,
            pstEndDatetime: req.body.pstEndDatetime
        }
        
        await User.findByIdAndUpdate(
            tutorId,
            { $push: {appointments: userNewAppt} }
        )

        await User.findByIdAndUpdate(
            req.userId,
            { $push: {appointments: userNewAppt} }
        )
        
        return res.status(200).send(newAppt)
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
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
    const events = await getCalendarEvents(
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

// ChatGPT usage: Partial
async function getManualFreeTimes(user, timeMin, timeMax) {
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
            start: timeMin.toISOString(true),
            end: timeMax.toISOString(true)
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

// ChatGPT usage: Yes
function toPST(dateString) {
    return momenttz(dateString).tz('America/Los_Angeles').format();
}

module.exports.appointmentIsCompleted = appointmentIsCompleted
module.exports.appointmentIsAccepted = appointmentIsAccepted
module.exports.getAppointmentStatus = getAppointmentStatus