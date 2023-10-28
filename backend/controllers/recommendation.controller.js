const db = require("../db")
const { LocationMode } = require("../constants/location.modes");
const haversine = require('haversine')
const mongoose = require('mongoose')

const User = db.user

exports.checkedProfile = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.body.tutorId)) {
        return res.status(400).send({ message: "Invalid provided tutorId" })
    }
    const tutor = await User.findById(req.body.tutorId)
    const tutee = await User.findById(req.userId)
    if (!tutor)
        return res.status(400).send({ message: "Could not find tutor in database with provided id"})
    if (!tutee)
        return res.status(400).send({ message: "Could not find tutee in database with provided id"})

    if (tutor.rating) {
        tutee.recommendationWeights.minRating -= (tutee.recommendationWeights.minRating - tutor.rating) * (tutor.rating < tutee.recommendationWeights.minRating ? 0.15 : 0.05)
        tutee.recommendationWeights.locationModeWeight -= (tutor.locationMode != tutee.locationMode ? 0.01 : -0.005)
    }

    if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location) {
        const distance = haversine({ latitude: tutee.location.lat, longitude: tutee.location.long}, { latitude: tutor.location.lat, longitude: tutor.location.long})
        tutee.recommendationWeights.maxDistance += (distance - tutee.recommendationWeights.maxDistance) * (distance > tutee.recommendationWeights.maxDistance ? 0.15 : 0.02)
    }

    tutee.save()
    return res.status(200).send({ message: "Adjusted weights based on checked profile"})
}

exports.contactedTutor = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.body.tutorId)) {
        return res.status(400).send({ message: "Invalid provided tutorId" })
    }
    const tutor = await User.findById(req.body.tutorId)
    const tutee = await User.findById(req.userId)
    if (!tutor)
        return res.status(400).send({ message: "Could not find tutor in database with provided id"})
    if (!tutee)
        return res.status(400).send({ message: "Could not find tutee in database with provided id"})

    if (!tutor.subjectHourlyRate || tutor.subjectHourlyRate.length != 0) {
        const averageHourlyRate = tutor.subjectHourlyRate.reduce((acc, subject) => acc + subject.hourlyRate, 0) / tutor.subjectHourlyRate.length
        tutee.recommendationWeights.budget += (averageHourlyRate - tutee.recommendationWeights.budget) * (averageHourlyRate > tutee.recommendationWeights.budget ? 0.15 : 0.05)
    }

    if (tutor.rating) {
        tutee.recommendationWeights.minRating -= (tutee.recommendationWeights.minRating - tutor.rating) * (tutor.rating < tutee.recommendationWeights.minRating ? 0.3 : 0.05)
        tutee.recommendationWeights.locationModeWeight -= (tutor.locationMode != tutee.locationMode ? 0.05 : -0.01)
    }

    if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location) {
        const distance = haversine({ latitude: tutee.location.lat, longitude: tutee.location.long}, { latitude: tutor.location.lat, longitude: tutor.location.long})
        tutee.recommendationWeights.maxDistance += (distance - tutee.recommendationWeights.maxDistance) * (distance > tutee.recommendationWeights.maxDistance ? 0.2 : 0.02)
    }

    tutee.save()
    return res.status(200).send({ message: "Adjusted weights based on contacted tutor"})
}

exports.scheduledAppointment = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.body.tutorId)) {
        return res.status(400).send({ message: "Invalid provided tutorId" })
    }
    const tutor = await User.findById(req.body.tutorId)
    const tutee = await User.findById(req.userId)
    if (!tutor)
        return res.status(400).send({ message: "Could not find tutor in database with provided id"})
    if (!tutee)
        return res.status(400).send({ message: "Could not find tutee in database with provided id"})

    const scheduledSubjectHourlyRate = tutor.subjectHourlyRate.find(subject => subject.course == req.body.scheduledSubject)
    if (!scheduledSubjectHourlyRate)
        return res.status(500).send({ message: "Unable to find hourly rate associated with subject" })

    tutee.recommendationWeights.budget += (scheduledSubjectHourlyRate - tutee.recommendationWeights.budget) * (scheduledSubjectHourlyRate > tutee.recommendationWeights.budget ? 0.5 : 0.1)

    if (tutor.rating) {
        tutee.recommendationWeights.minRating -= (tutee.recommendationWeights.minRating - tutor.rating) * (tutor.rating < tutee.recommendationWeights.minRating ? 0.5 : 0.1)
        tutee.recommendationWeights.locationModeWeight -= (tutor.locationMode != tutee.locationMode ? 0.1 : -0.02)
    }

    if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location) {
        const distance = haversine({ latitude: tutee.location.lat, longitude: tutee.location.long}, { latitude: tutor.location.lat, longitude: tutor.location.long})
        tutee.recommendationWeights.maxDistance += (distance - tutee.recommendationWeights.maxDistance) * (distance > tutee.recommendationWeights.maxDistance ? 0.4 : 0.1)
    }

    tutee.save()
    return res.status(200).send({ message: "Adjusted weights based on scheduled appointment"})
}

exports.reviewedTutor = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.body.tutorId)) {
        return res.status(400).send({ message: "Invalid provided tutorId" })
    }
    const tutor = await User.findById(req.body.tutorId)
    const tutee = await User.findById(req.userId)
    if (!tutor)
        return res.status(400).send({ message: "Could not find tutor in database with provided id"})
    if (!tutee)
        return res.status(400).send({ message: "Could not find tutee in database with provided id"})

    const reviewFactor = req.body.review * 0.1

    if (!tutor.subjectHourlyRate || tutor.subjectHourlyRate.length != 0) {
        const averageHourlyRate = tutor.subjectHourlyRate.reduce((acc, subject) => acc + subject.hourlyRate, 0) / tutor.subjectHourlyRate.length
        tutee.recommendationWeights.budget += (averageHourlyRate - tutee.recommendationWeights.budget) * (averageHourlyRate > tutee.recommendationWeights.budget ? 0.15 : 0.05) * reviewFactor
    }

    if (tutor.rating) {
        tutee.recommendationWeights.minRating -= (tutee.recommendationWeights.minRating - tutor.rating) * (tutor.rating < tutee.recommendationWeights.minRating ? 0.3 : 0.05) * reviewFactor
        tutee.recommendationWeights.locationModeWeight -= (tutor.locationMode != tutee.locationMode ? 0.05 : -0.01) * reviewFactor
    }
    
    if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location) {
        const distance = haversine({ latitude: tutee.location.lat, longitude: tutee.location.long}, { latitude: tutor.location.lat, longitude: tutor.location.long})
        tutee.recommendationWeights.maxDistance += (distance - tutee.recommendationWeights.maxDistance) * (distance > tutee.recommendationWeights.maxDistance ? 0.2 : 0.02) * reviewFactor
    }

    tutee.save()
    return res.status(200).send({ message: "Adjusted weights based on reviewed tutor"})
}
