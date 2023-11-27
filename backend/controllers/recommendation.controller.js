const db = require("../db")
const { LocationMode } = require("../constants/location.modes");
const haversine = require('haversine')

const User = db.user

// ChatGPT usage: No
exports.checkedProfile = async (req, res) => {
    // checkedProfile
    try {
        const tutor = await User.findById(req.body.tutorId)
        const tutee = await User.findById(req.userId)
    
        if (!tutor || tutor.isBanned)
            return res.status(404).send({ message: "Could not find tutor in database with provided id"})
    
        if (tutor.overallRating)
            tutee.recommendationWeights.minRating -= (tutee.recommendationWeights.minRating - tutor.overallRating) *
                (tutor.overallRating < tutee.recommendationWeights.minRating ? 0.15 : 0.05)
    
        tutee.recommendationWeights.locationModeWeight -= (tutor.locationMode != tutee.locationMode ?
            0.01 :
            -0.005
        )
    
        if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location) {
            const distance = haversine({ latitude: tutee.location.lat, longitude: tutee.location.long },
                { latitude: tutor.location.lat, longitude: tutor.location.long })
            tutee.recommendationWeights.maxDistance += (distance - tutee.recommendationWeights.maxDistance) *
                (distance > tutee.recommendationWeights.maxDistance ? 0.15 : 0.02)
        }
    
        await tutee.save()
        return res.status(200).send({ message: "Adjusted weights based on checked profile"})
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
}

// ChatGPT usage: No
exports.contactedTutor = async (req, res) => {
    // contactedTutor
    try {
        const tutor = await User.findById(req.body.tutorId)
        const tutee = await User.findById(req.userId)

        if (!tutor || tutor.isBanned)
            return res.status(404).send({ message: "Could not find tutor in database with provided id"})

        if (tutor.subjectHourlyRate && tutor.subjectHourlyRate.length !== 0) {
            const averageHourlyRate = tutor.subjectHourlyRate.reduce((acc, subject) =>
                acc + subject.hourlyRate, 0) / tutor.subjectHourlyRate.length
            tutee.recommendationWeights.budget += (averageHourlyRate - tutee.recommendationWeights.budget) *
                (averageHourlyRate > tutee.recommendationWeights.budget ? 0.15 : 0.05)
        }

        if (tutor.overallRating)
            tutee.recommendationWeights.minRating -= (tutee.recommendationWeights.minRating - tutor.overallRating) *
                (tutor.overallRating < tutee.recommendationWeights.minRating ? 0.3 :0.05)
        
        tutee.recommendationWeights.locationModeWeight -= (tutor.locationMode != tutee.locationMode ?
            0.05 :
            -0.01
        )

        if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location) {
            const distance = haversine({ latitude: tutee.location.lat, longitude: tutee.location.long },
                { latitude: tutor.location.lat, longitude: tutor.location.long })
            tutee.recommendationWeights.maxDistance += (distance - tutee.recommendationWeights.maxDistance) *
                (distance > tutee.recommendationWeights.maxDistance ? 0.2 : 0.02)
        }

        await tutee.save()
        return res.status(200).send({ message: "Adjusted weights based on contacted tutor"})
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
}

// ChatGPT usage: No
exports.scheduledAppointment = async (req, res) => {
    // scheduledAppointment
    try {
        const tutor = await User.findById(req.body.tutorId)
        const tutee = await User.findById(req.userId)
    
        if (!tutor || tutor.isBanned)
            return res.status(404).send({ message: "Could not find tutor in database with provided id"})
    
        if (tutor.subjectHourlyRate && tutor.subjectHourlyRate.length !== 0) {
            const scheduledSubjectHourlyRate = tutor.subjectHourlyRate.find(subject => subject.course == req.body.scheduledSubject)
            if (!scheduledSubjectHourlyRate)
                return res.status(500).send({ message: "Unable to find hourly rate associated with subject" })
        
            tutee.recommendationWeights.budget += (
                scheduledSubjectHourlyRate.hourlyRate - 
                tutee.recommendationWeights.budget) * 
                (scheduledSubjectHourlyRate.hourlyRate > tutee.recommendationWeights.budget ? 0.5 : 0.1)
        }
    
        if (tutor.overallRating)
            tutee.recommendationWeights.minRating -= (tutee.recommendationWeights.minRating - tutor.overallRating) *
                (tutor.overallRating < tutee.recommendationWeights.minRating ? 0.5 : 0.1)
    
        tutee.recommendationWeights.locationModeWeight -= (tutor.locationMode != tutee.locationMode ?
            0.1 :
            -0.0
        )
    
        if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location) {
            const distance = haversine({ latitude: tutee.location.lat, longitude: tutee.location.long},
                { latitude: tutor.location.lat, longitude: tutor.location.long})
            tutee.recommendationWeights.maxDistance += (distance - tutee.recommendationWeights.maxDistance) *
                (distance > tutee.recommendationWeights.maxDistance ? 0.4 : 0.1)
        }
    
        await tutee.save()
        return res.status(200).send({ message: "Adjusted weights based on scheduled appointment"})
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
}

// ChatGPT usage: No
exports.reviewedTutor = async (req, res) => {
    // reviewedTutor
    try {
        const tutor = await User.findById(req.body.tutorId)
        const tutee = await User.findById(req.userId)

        if (!tutor || tutor.isBanned)
            return res.status(404).send({ message: "Could not find tutor in database with provided id"})

        const reviewFactor = req.body.review * 0.1

        if (tutor.subjectHourlyRate && tutor.subjectHourlyRate.length !== 0) {
            const averageHourlyRate = tutor.subjectHourlyRate.reduce((acc, subject) => 
                acc + subject.hourlyRate, 0) / tutor.subjectHourlyRate.length
            tutee.recommendationWeights.budget += (averageHourlyRate - tutee.recommendationWeights.budget) *
                (averageHourlyRate > tutee.recommendationWeights.budget ? 0.15 : 0.05) * reviewFactor
        }

        if (tutor.overallRating)
            tutee.recommendationWeights.minRating -= (tutee.recommendationWeights.minRating - tutor.overallRating) *
                (tutor.overallRating < tutee.recommendationWeights.minRating ? 0.3 : 0.05) * reviewFactor

        tutee.recommendationWeights.locationModeWeight -= (tutor.locationMode != tutee.locationMode ?
            0.05 :
            -0.01
        ) * reviewFactor
        
        if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location) {
            const distance = haversine({ latitude: tutee.location.lat, longitude: tutee.location.long },
                { latitude: tutor.location.lat, longitude: tutor.location.long })
            tutee.recommendationWeights.maxDistance += (distance - tutee.recommendationWeights.maxDistance) *
                (distance > tutee.recommendationWeights.maxDistance ? 0.2 : 0.02) * reviewFactor
        }

        await tutee.save()
        return res.status(200).send({ message: "Adjusted weights based on reviewed tutor"})
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message })
    }
}
