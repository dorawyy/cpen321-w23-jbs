const { AppointmentStatus } = require("../constants/appointment.status");
const { UserType } = require("../constants/user.types");
const db = require("../db")
const googleUtils = require("../utils/google.utils")
const apptUtils = require("../utils/appointment.utils")
const momenttz = require("moment-timezone")

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
        var upcomingAppointments = await apptUtils.cleanupUserAppointments(user)
    
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
            await googleUtils.cancelGoogleEvent(user, otherUser, canceledAppt)
        }
        if (otherUser.useGoogleCalendar) {
            await googleUtils.cancelGoogleEvent(otherUser, user, canceledAppt)
        }
    
        await apptUtils.cleanupUserAppointments(user)
        
        await apptUtils.cleanupUserAppointments(otherUser)
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
            var freeTimes = await googleUtils.getFreeTime(
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
                
                for (block of dayAvailabilities) {            
                    var start = momenttz(`${date}T${block.startTime}:00-07:00`)
                        .tz('America/Los_Angeles')
                        .toISOString(true)
                    var end = momenttz(`${date}T${block.endTime}:00-07:00`)
                        .tz('America/Los_Angeles')
                        .toISOString(true)
                    var freeTimes = await apptUtils.getManualFreeTimes(
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
        var upcomingAppointments = await apptUtils.cleanupUserAppointments(user)
    
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
            await googleUtils.createGoogleEvent(tutor, tutee, acceptedAppt)
        }
        if (tutee.useGoogleCalendar) {
            await googleUtils.createGoogleEvent(tutee, tutor, acceptedAppt)
        }
        
        await apptUtils.cleanupUserAppointments(tutor).then(result => {
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

exports.getUserAppointments = async (req, res) => {
    try {
        var userId = req.userId
        var courses = req.query.courses ? req.query.courses.split(',') : []
        var courseQuery = courses ? { course: { $in: courses } } : {};
    
        var user = await User.findById(userId)
            
        if (!user || user.isBanned) {
            return res.status(404).send({
                message: "The other user is not found"
            })
        }
        
        var appointments = await apptUtils.cleanupUserAppointments(user)
        var appointmentIds = appointments.map(appt => appt._id)
    
    
        var filteredAppts = await Appointment
            .find(courseQuery)
            .where('_id')
            .in(appointmentIds)
    
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
                                var otherUser = await User
                                    .findById(user.userId)
                                    
                                if (!otherUser || otherUser.isBanned) {
                                    return res.status(404).send({
                                        message: "The other user is not found"
                                    })
                                }
                                otherUserName = otherUser.displayedName
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
    
        req.body.pstStartDatetime = apptUtils.toPST(req.body.pstStartDatetime)
        req.body.pstEndDatetime = apptUtils.toPST(req.body.pstEndDatetime)
    
        var tutorIsAvailable = await apptUtils.isAvailable(tutor, req.body.pstStartDatetime, req.body.pstEndDatetime)
        var tuteeIsAvailable = await apptUtils.isAvailable(tutee, req.body.pstStartDatetime, req.body.pstEndDatetime)
    
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

    var upcomingAppointments = await apptUtils.cleanupUserAppointments(user)
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


