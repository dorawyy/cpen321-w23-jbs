const db = require("../db")
const { LocationMode } = require("../constants/location.modes");
const haversine = require('haversine')

const User = db.user

exports.checkedProfile = async (req, res) => {
    const tutor = await User.find({ username: req.body.tutorUsername }).exec()
    const tutee = await User.findById(req.userId).exec()
    const distance = haversine(tutor.location, tutee.location)

    var adjustedWeights = tutee.recommendationWeights

    if (tutor.rating < adjustedWeights.minRating)
        adjustedWeights.minRating -= (adjustedWeights.minRating - tutor.rating) * 0.15
    else
        adjustedWeights.minRating -= (adjustedWeights.minRating - tutor.rating) * 0.05

    if (tutor.locationMode != tutee.locationMode)
        adjustedWeights.locationModeWeight -= 0.01
    else
        adjustedWeights.locationModeWeight += 0.005

    if (tutee.locationMode == LocationMode.IN_PERSON)
        if (distance > adjustedWeights.maxDistance)
            adjustedWeights.maxDistance += (distance - adjustedWeights.maxDistance) * 0.15
        else
            adjustedWeights.maxDistance += (distance - adjustedWeights.maxDistance) * 0.02

    User.findByIdAndUpdate(req.userId, {recommendationWeights: adjustedWeights}).exec()
    res.status(200).send({ message: "Adjusted weights based on checked profile"})
}

exports.contactedTutor = async (req, res) => {
    const tutor = await User.find({ username: req.body.tutorUsername }).exec()
    const tutee = await User.findById(req.userId).exec()
    const distance = haversine(tutor.location, tutee.location)

    var adjustedWeights = tutee.recommendationWeights

    if (tutor.subjectHourlyRate.length != 0) {
        const averageHourlyRate = tutor.subjectHourlyRate.reduce((acc, subject) => acc + subject.hourlyRate) / tutor.subjectHourlyRate.length
        if (averageHourlyRate > adjustedWeights.budget)
            adjustedWeights.budget += (averageHourlyRate - adjustedWeights.budget) * 0.15
        else
            adjustedWeights.budget += (averageHourlyRate - adjustedWeights.budget) * 0.05
    }
    if (tutor.rating < adjustedWeights.minRating)
        adjustedWeights.minRating -= (adjustedWeights.minRating - tutor.rating) * 0.3
    else
        adjustedWeights.minRating -= (adjustedWeights.minRating - tutor.rating) * 0.05

    if (tutor.locationMode != tutee.locationMode)
        adjustedWeights.locationModeWeight -= 0.05
    else
        adjustedWeights.locationModeWeight += 0.01

    if (tutee.locationMode == LocationMode.IN_PERSON)
        if (distance > adjustedWeights.maxDistance)
            adjustedWeights.maxDistance += (distance - adjustedWeights.maxDistance) * 0.2
        else
            adjustedWeights.maxDistance += (distance - adjustedWeights.maxDistance) * 0.02

    User.findByIdAndUpdate(req.userId, {recommendationWeights: adjustedWeights}).exec()
    res.status(200).send({ message: "Adjusted weights based on contacted tutor"})
}

exports.scheduledAppointment = async (req, res) => {
    const tutor = await User.find({ username: req.body.tutorUsername }).exec()
    const tutee = await User.findById(req.userId).exec()
    const distance = haversine(tutor.location, tutee.location)
    const scheduledSubjectHourlyRate = tutor.subjectHourlyRate.find(subject => subject.course == req.body.scheduledSubject)
    if (!scheduledSubjectHourlyRate)
        res.status(500).send({ message: "Unable to find hourly rate associated with subject" })

    var adjustedWeights = tutee.recommendationWeights

    if (scheduledSubjectHourlyRate > adjustedWeights.budget)
        adjustedWeights.budget += (averageHourlyRate - adjustedWeights.budget) * 0.5
    else
        adjustedWeights.budget += (averageHourlyRate - adjustedWeights.budget) * 0.1
    if (tutor.rating < adjustedWeights.minRating)
        adjustedWeights.minRating -= (adjustedWeights.minRating - tutor.rating) * 0.5
    else
        adjustedWeights.minRating -= (adjustedWeights.minRating - tutor.rating) * 0.1

    if (tutor.locationMode != tutee.locationMode)
        adjustedWeights.locationModeWeight -= 0.1
    else
        adjustedWeights.locationModeWeight += 0.02

    if (tutee.locationMode == LocationMode.IN_PERSON)
        if (distance > adjustedWeights.maxDistance)
            adjustedWeights.maxDistance += (distance - adjustedWeights.maxDistance) * 0.4
        else
            adjustedWeights.maxDistance += (distance - adjustedWeights.maxDistance) * 0.1

    User.findByIdAndUpdate(req.userId, {recommendationWeights: adjustedWeights}).exec()
    res.status(200).send({ message: "Adjusted weights based on scheduled appointment"})
}

exports.reviewedTutor = async (req, res) => {
    const tutor = await User.find({ username: req.body.tutorUsername }).exec()
    const tutee = await User.findById(req.userId).exec()
    const distance = haversine(tutor.location, tutee.location)
    const reviewFactor = req.body.review * 0.1

    var adjustedWeights = tutee.recommendationWeights

    if (tutor.subjectHourlyRate.length != 0) {
        const averageHourlyRate = tutor.subjectHourlyRate.reduce((acc, subject) => acc + subject.hourlyRate) / tutor.subjectHourlyRate.length
        if (averageHourlyRate > adjustedWeights.budget)
            adjustedWeights.budget += (averageHourlyRate - adjustedWeights.budget) * 0.15 * reviewFactor
        else
            adjustedWeights.budget += (averageHourlyRate - adjustedWeights.budget) * 0.05 * reviewFactor
    }
    if (tutor.rating < adjustedWeights.minRating)
        adjustedWeights.minRating -= (adjustedWeights.minRating - tutor.rating) * 0.3 * reviewFactor
    else
        adjustedWeights.minRating -= (adjustedWeights.minRating - tutor.rating) * 0.05 * reviewFactor

    if (tutor.locationMode != tutee.locationMode)
        adjustedWeights.locationModeWeight -= 0.05 * reviewFactor
    else
        adjustedWeights.locationModeWeight += 0.01 * reviewFactor

    if (tutee.locationMode == LocationMode.IN_PERSON)
        if (distance > adjustedWeights.maxDistance)
            adjustedWeights.maxDistance += (distance - adjustedWeights.maxDistance) * 0.2 * reviewFactor
        else
            adjustedWeights.maxDistance += (distance - adjustedWeights.maxDistance) * 0.02 * reviewFactor

    User.findByIdAndUpdate(req.userId, {recommendationWeights: adjustedWeights}).exec()
    res.status(200).send({ message: "Adjusted weights based on reviewed tutor"})
}
