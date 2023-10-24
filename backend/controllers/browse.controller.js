const db = require("../db")
const { LocationMode } = require("../constants/location.modes");
const haversine = require('haversine')

const User = db.user

exports.recommended = async (req, res) => {
    const tutee = await User.findById(req.userId)

    if (req.query.courses) {
        const tutors = await User.find({
            'education.courses': { $in: req.query.courses.split(',')}
        })
        tutors.sort((a, b) => score(tutee, b) - score(tutee, a))
    }
}

// sum of individual piecewise score functions
function score(tutee, tutor) {
    var aggregate = 0
    
    aggregate += budgetScore(tutee.recommendationWeights.budget, tutor.subjectHourlyRate)
    aggregate += ratingScore(tutee.recommendationWeights.minRating, tutor.rating)
    aggregate += locationModeScore(tutee.recommendationWeights.locationModeWeight, tutee.locationMode, tutor.locationMode)
    if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location)
        aggregate += distanceScore(tutee.recommendationWeights.maxDistance, tutee.location, tutor.location)

    return aggregate
}

function budgetScore(budget, subjectHourlyRate) {
    const averageHourlyRate = subjectHourlyRate.reduce((acc, subject) => acc + subject.hourlyRate) / tutor.subjectHourlyRate.length
    return averageHourlyRate < budget ? 100 - (1/3) * averageHourlyRate : 100 - (1/3) * budget - (2/3) * (averageHourlyRate - budget)
}

function ratingScore(minRating, rating) {
    return rating > minRating ? 80 + 4 * (rating - minRating) : 80 + 40 * (rating - minRating)
}

function locationModeScore(locationModeWeight, tuteeLocationMode, tutorLocationMode) {
    if (locationModeWeight <= 0) return 0
    return tuteeLocationMode == tutorLocationMode ? 100 * locationModeWeight : -100 * locationModeWeight
}

function distanceScore(maxDistance, tuteeLocation, tutorLocation) {
    const distance = haversine(tutor.location, tutee.location)
    return distance < maxDistance ? 100 - (1/3) * distance : 100 - (1/3) * maxDistance - (2/3) * (distance - maxDistance)
}
