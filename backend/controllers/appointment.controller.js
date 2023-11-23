const { AppointmentStatus, PST_TIMEZONE } = require("../constants/appointment.status");
const { UserType } = require("../constants/user.types");
const db = require("../db")
const googleUtils = require("../utils/google.utils")
const apptUtils = require("../utils/appointment.utils")
const momenttz = require("moment-timezone")

const User = db.user
const Appointment = db.appointment

// ChatGPT usage: No
exports.cancelAppointment = async (req, res) => {
    try {
        var userId = req.userId
        var apptId = req.query.appointmentId
        
        var user = await User.findById(userId)

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
                message: "Appointment not found. You can't cancel a past appointment."
            })
        }
    
        var canceledAppt = await Appointment.findByIdAndUpdate(
            apptId, {status: AppointmentStatus.CANCELED},
            { new: true }
        )

        if (!canceledAppt) {
            return res.status(404).send({
                message: "Unable to cancel appointment. Appointment not found"
            })
        }
    
        user = await User.findById(userId)

        if (user.useGoogleCalendar) {
            await googleUtils.cancelGoogleEvent(user, otherUser, canceledAppt)
        }
        await apptUtils.cleanupUserAppointments(user)

        var otherUserId = canceledAppt.participantsInfo
            .filter(user => user.userId != userId)[0].userId
        
        var otherUser = await User.findById(otherUserId)

        if (!otherUser || otherUser.isBanned) {
            return res.status(200).send({ 
                message: "Canceled appointment successfully. However, the other user was not found or was banned" 
            })
        }
        
        if (otherUser.useGoogleCalendar) {
            await googleUtils.cancelGoogleEvent(otherUser, user, canceledAppt)
        }
    
        await apptUtils.cleanupUserAppointments(otherUser)
            
        return res.status(200).send({
            message: "Canceled appointment successfully"
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            message: err.message
        })
    }   
}

// ChatGPT usage: No
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
            return res.status(404).send({ message: "User not found" })
        }
            
        var tzOffset = momenttz(date)
                    .tz(PST_TIMEZONE)
                    .format('Z')

        var timeMin = momenttz(`${date}T08:00:00${tzOffset}`)
            .tz(PST_TIMEZONE)
            .toISOString(true)
    
        var timeMax = momenttz(`${date}T19:00:00${tzOffset}`)
            .tz(PST_TIMEZONE)
            .toISOString(true)
    
        if (tutor.useGoogleCalendar) {
            var freeTimes = await googleUtils.getFreeTime(
                tutor, timeMin, timeMax
            )
            var ret = {
                availability: freeTimes
            }
            return res.status(200).send(ret)
        } else {
            if (tutor.manualAvailability) {
                var requestedDay = momenttz(date).format("dddd")
                var dayAvailabilities = tutor.manualAvailability.filter(avail => {
                    return avail.day === requestedDay 
                })
                var availabilities = []
                
                for (var block of dayAvailabilities) {            
                    var start = momenttz(`${date}T${block.startTime}:00${tzOffset}`)
                        .tz(PST_TIMEZONE)
                        .toISOString(true)
                    var end = momenttz(`${date}T${block.endTime}:00${tzOffset}`)
                        .tz(PST_TIMEZONE)
                        .toISOString(true)
                    var availability = await apptUtils.getManualFreeTimes(
                        tutor, start, end
                    )
                    availabilities = availabilities.concat(availability)
                }

                return res.status(200).send({
                    availability: availabilities
                })
            } else {
                var defaultFreetimes = [{
                    start: `${date}T08:00:00.000${tzOffset}`,
                    end: `${date}T19:00:00.000${tzOffset}`
                }]
                return res.status(200).send({
                    availability: defaultFreetimes
                })
            }
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
        
}

// ChatGPT usage: No
exports.acceptAppointment = async (req, res) => {
    try {
        var userId = req.userId
        var user = await User.findById(userId)   
        if (user.type === UserType.TUTEE) {
            return res.status(403).send({ 
                message: "Only tutors are allowed to accept appointments." 
            })
        }

        var apptId = req.query.appointmentId
        if (!apptId) {
            return res.status(400).send({
                message: "appointmentId is required"
            })
        }

        var upcomingAppointments = await apptUtils.cleanupUserAppointments(user)
        
        var usersApptIds = upcomingAppointments.map(appt => appt._id)
        var idStrings = usersApptIds.map(id => id.toString())
    
        if (!(idStrings.includes(apptId))) {
            return res.status(404).send({
                message: "Appointment not found. Can't accept a past appointment"
            })
        }

        var acceptedAppt = await Appointment.findById(apptId)
        var tuteeId = acceptedAppt.participantsInfo
            .filter(user => user.userId != userId)[0].userId
        
        var tutee = await User.findById(tuteeId)

        if (!tutee || tutee.isBanned) {
            return res.status(404).send({ message: "Unable to accept appointment. Tutee is not found or banned." })
        }

        acceptedAppt.status = AppointmentStatus.ACCEPTED
        acceptedAppt = await acceptedAppt.save()

        if (!acceptedAppt) {
            return res.status(404).send({
                message: "Unable to update appointment. Appointment not found"
            }) 
        }

        var overlaps = upcomingAppointments.filter(appt => {
            return apptUtils.isConflicted(appt, acceptedAppt)
        })
        var overlapsIds = overlaps.map(appt => appt._id)

        var query = {
            _id: { $in: overlapsIds, $ne: apptId }, 
            status: AppointmentStatus.PENDING,
        }
    
        await Appointment.updateMany(
            query,
            { status: AppointmentStatus.CANCELED },
        )

        var tutor = await User.findById(userId)

        if (tutor.useGoogleCalendar) {
            await googleUtils.createGoogleEvent(tutor, tutee, acceptedAppt)
        }
        if (tutee.useGoogleCalendar) {
            await googleUtils.createGoogleEvent(tutee, tutor, acceptedAppt)
        }
        
        await apptUtils.cleanupUserAppointments(tutor)

        return res.status(200).send({
            message: "Accepted appointment successfully"
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
        var user = await User.findById(userId).catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
        })
            
        if (!user || user.isBanned) {
            return res.status(404).send({
                message: "The other user is not found"
            })
        }

        var timeMin = momenttz()
            .tz(PST_TIMEZONE)
            .subtract(15, 'days')
            .startOf('day')
            .toISOString(true)
        
        var timeMax = momenttz()
            .tz(PST_TIMEZONE)
            .add(15, 'days')
            .endOf('day')
            .toISOString(true)
        

        var query = { 
            $or: [
                { pstEndDatetime: { $gte: timeMin, $lte: timeMax } },
                { pstStartDatetime: { $gte: timeMin, $lte: timeMax } },
            ],
            'participantsInfo.userId': userId,
        }

        if (courses.length > 0) {
            query.course = {
                $in: courses
            }
        }

        var appointments = await Appointment
            .find({
                ...query
            })
            .sort({ pstStartDatetime: 'asc'})
            .catch(err => {
                console.log(err)
                return res.status(500).send({ message: err.message })
            })

        return res.status(200).send({appointments})
    } catch (err) {
        console.log(err)
        return res.status(500).send({
            message: err.message
        })
    }
    
}

// ChatGPT usage: No
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
                        for (var user of appt.participantsInfo) {
                            if (user.userId != req.userId) {
                                otherUserName = user.displayedName
                            }
                        }
                        var ret = {
                            ...appt.toObject(),
                            otherUserName
                        }
                        return res.status(200).send(ret)
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).send({ message: err.message })
                    })
    } catch (err) {
        return res.status(500).send({
            message: err.message
        })
    }
}

// ChatGPT usage: No
exports.bookAppointment = async (req, res) => {
    try {
        const tutorId = req.body.tutorId
        var tutor = await User.findById(tutorId)
            .catch(err => {
                console.log(err)
                return res.status(500).send({ message: err.message })
            })
        if (!tutor || tutor.isBanned) {
            return res.status(400).send({ message: "User not found." })
        }
    
        var tutee = await User.findById(req.userId)
            .catch(err => {
                console.log(err)
                return res.status(500).send({ message: err.message })
            })
        if (!tutee || tutee.isBanned) {
            return res.status(400).send({ message: "User not found." })
        }
    
        req.body.pstStartDatetime = apptUtils.toPST(req.body.pstStartDatetime)
        req.body.pstEndDatetime = apptUtils.toPST(req.body.pstEndDatetime)
    
        var tutorIsAvailable = await apptUtils
            .isAvailable(
                tutor, req.body.pstStartDatetime, req.body.pstEndDatetime
            )
            .catch(err => {
                console.log(err)
                return res.status(500).send({ message: err.message })
            })
        
        var tuteeIsAvailable = await apptUtils
            .isAvailable(
                tutee, req.body.pstStartDatetime, req.body.pstEndDatetime
            )
            .catch(err => {
                console.log(err)
                return res.status(500).send({ message: err.message })
            })

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
            
        }).save().catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
        })
    
        var userNewAppt = {
            _id: newAppt._id,
            pstStartDatetime: req.body.pstStartDatetime,
            pstEndDatetime: req.body.pstEndDatetime
        }
        
        await User.findByIdAndUpdate(
            tutorId, { $push: {appointments: userNewAppt} }
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
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
}
