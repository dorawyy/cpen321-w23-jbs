const db = require("../db")
const { UserType } = require("../constants/user.types");
const { LocationMode } = require("../constants/location.modes");
const haversine = require('haversine')

const User = db.user

exports.recommended = async (req, res) => {
    if (req.query.page < 1)
        return res.status(400).send({ message: "Page number cannot be less than 1" })

    const tutee = await User.findById(req.userId)
    if (!tutee)
        return res.status(404).send({ message: "Could not find tutee in database with provided id"})

    if (req.query.courses) {
        // specific course browse
        const tutors = await User.find({
            'education.courses': { $in: req.query.courses.split(',')},
            'type': UserType.TUTOR
        })
        tutors.sort((a, b) => score(tutee, b) - score(tutee, a))

        // note: the slice() method handles slicing beyond the end of the array
        const tutorsToDisplay = tutors.slice((req.query.page - 1) * 10, req.query.page * 10)

        return res.status(200).json({
            tutors: tutorsToDisplay.map(tutor => ({
                tutorId: tutor._id,
                displayedName: tutor.displayedName,
                rating: tutor.overallRating,
                locationMode: tutor.locationMode,
                location: tutor.location,
                school: tutor.education.school,
                courses: tutor.education.courses,
                tags: tutor.education.tags,
                pricing: tutor.subjectHourlyRate.filter(subject => req.query.courses.includes(subject.course))
            }))
        })
    } else {
        // generic browse
        if (tutee.education.courses) {
            // filter tutors by tutee's courses if field is set
            const tutorsWithSharedCourses = await User.find({
                'education.courses': { $in: tutee.education.courses },
                'type': UserType.TUTOR
            })
            if (req.query.page * 10 <= tutorsWithSharedCourses.length) {
                // the page will display only tutors with shared courses
                tutorsWithSharedCourses.sort((a, b) => score(tutee, b) - score(tutee, a))
                const tutorsToDisplay = tutorsWithSharedCourses.slice((req.query.page - 1) * 10, req.query.page * 10)

                return res.status(200).json({
                    tutors: tutorsToDisplay.map(tutor => ({
                        tutorId: tutor._id,
                        displayedName: tutor.displayedName,
                        rating: tutor.overallRating,
                        locationMode: tutor.locationMode,
                        location: tutor.location,
                        school: tutor.education.school,
                        courses: tutor.education.courses,
                        tags: tutor.education.tags,
                    }))
                })
            } else if ((req.query.page - 1) * 10 < tutorsWithSharedCourses.length && 
                        req.query.page * 10 > tutorsWithSharedCourses.length) {
                // the page will display the bottom of the scored tutors with shared courses, and the top of the scored tutors without shared courses
                const tutorsWithoutSharedCourses = await User.find({
                    'education.courses': { $nin: tutee.education.courses },
                    'type': UserType.TUTOR
                })
                tutorsWithSharedCourses.sort((a, b) => score(tutee, b) - score(tutee, a))
                tutorsWithoutSharedCourses.sort((a, b) => score(tutee, b) - score(tutee, a))
                const tutorsToDisplay = [
                    ...tutorsWithSharedCourses.slice((req.query.page - 1) * 10, tutorsWithSharedCourses.length),
                    ...tutorsWithoutSharedCourses.slice(0, req.query.page * 10 - tutorsWithSharedCourses.length)
                ]

                return res.status(200).json({
                    tutors: tutorsToDisplay.map(tutor => ({
                        tutorId: tutor._id,
                        displayedName: tutor.displayedName,
                        rating: tutor.overallRating,
                        locationMode: tutor.locationMode,
                        location: tutor.location,
                        school: tutor.education.school,
                        courses: tutor.education.courses,
                        tags: tutor.education.tags,
                    }))
                })
            } else if ((req.query.page - 1) * 10 >= tutorsWithSharedCourses.length) {
                // the page will display only tutors without shared courses
                const tutorsWithoutSharedCourses = await User.find({
                    'education.courses': { $nin: tutee.education.courses },
                    'type': UserType.TUTOR
                })
                tutorsWithoutSharedCourses.sort((a, b) => score(tutee, b) - score(tutee, a))
                const tutorsToDisplay = tutorsWithoutSharedCourses.slice((req.query.page - 1) * 10, req.query.page * 10)
                
                return res.status(200).json({
                    tutors: tutorsToDisplay.map(tutor => ({
                        tutorId: tutor._id,
                        displayedName: tutor.displayedName,
                        rating: tutor.overallRating,
                        locationMode: tutor.locationMode,
                        location: tutor.location,
                        school: tutor.education.school,
                        courses: tutor.education.courses,
                        tags: tutor.education.tags,
                    }))
                })
            }
        } else {
            // do not filter if courses field is not set
            const tutors = await User.find({
                'type': UserType.TUTOR
            })
            tutors.sort((a, b) => score(tutee, b) - score(tutee, a))
            const tutorsToDisplay = tutors.slice((req.query.page - 1) * 10, req.query.page * 10)
            
            return res.status(200).json({
                tutors: tutorsToDisplay.map(tutor => ({
                    tutorId: tutor._id,
                    displayedName: tutor.displayedName,
                    rating: tutor.overallRating,
                    locationMode: tutor.locationMode,
                    location: tutor.location,
                    school: tutor.education.school,
                    courses: tutor.education.courses,
                    tags: tutor.education.tags,
                }))
            })
        }
    }
}

// sum of individual piecewise score functions
function score(tutee, tutor) {
    var aggregate = 0

    aggregate += budgetScore(tutee.recommendationWeights.budget, tutor.subjectHourlyRate)
    aggregate += ratingScore(tutee.recommendationWeights.minRating, tutor.overallRating)
    aggregate += locationModeScore(tutee.recommendationWeights.locationModeWeight, tutee.locationMode, tutor.locationMode)
    if (tutee.locationMode == LocationMode.IN_PERSON && tutor.location)
        aggregate += distanceScore(tutee.recommendationWeights.maxDistance, tutee.location, tutor.location)

    return aggregate
}

function budgetScore(budget, subjectHourlyRate) {
    const averageHourlyRate = subjectHourlyRate.reduce((acc, subject) => acc + subject.hourlyRate) / subjectHourlyRate.length
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
    const distance = haversine(tutorLocation, tuteeLocation)
    return distance < maxDistance ? 100 - (1/3) * distance : 100 - (1/3) * maxDistance - (2/3) * (distance - maxDistance)
}
