const mongoose = require("mongoose");
const { UserType } = require("../constants/user.types");
const { LocationMode } = require("../constants/location.modes");

const educationSchema = new mongoose.Schema({
    school: String,
    program: String,
    level: Number,
    courses: [
        {
            type: String
        }
    ], // optional
    tags: [
        {
            type: String
        }
    ] // tutor only
})

const subjectHourlyRateSchema = new mongoose.Schema({
    course: String,
    hourlyRate: Number
})

const manualAvailabilitySchema = new mongoose.Schema({
    day: String,
    startTime: String,
    endTime: String
})

const oauthSchema = new mongoose.Schema({
    accessToken: String,
    refreshToken: String,
    expiryDate: String
})

const locationSchema = new mongoose.Schema({
    lat: Number,
    long: Number
})

const userReviewSchema = new mongoose.Schema({
    reviewerId: String,
    reviewerDisplayedName: String,
    noShow: Boolean,
    late: Boolean,
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    appointmentId: String,
}, { timestamps: true })

const recommendationWeightsSchema = new mongoose.Schema({
    budget: Number,
    minRating: Number,
    locationModeWeight: Number,
    maxDistance: Number
})

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        googleId: String,
        isBanned: {
            type: Boolean,
            default: false
        },
        googleOauth: oauthSchema,
        type: {
            type: String,
            enum: Object.values(UserType)
        },
        username: String,
        password: String,
        email: String,
        displayedName: String,
        phoneNumber: String,
        education: educationSchema,
        subjectHourlyRate: [
            {
                type: subjectHourlyRateSchema
            }
        ],
        manualAvailability: [
            {
                type: manualAvailabilitySchema
            }
        ],
        locationMode: {
            type: String,
            enum: Object.values(LocationMode)
        },
        location: locationSchema,
        recommendationWeights: recommendationWeightsSchema,
        previousSubjects: [
            {
                type: String,
            }
        ],
        bio: String,
        useGoogleCalendar: {
            type: Boolean,
            default: false
        },
        userReviews: [
            {
                type: userReviewSchema
            }
        ],
        overallRating: {
            type: Number,
            default: 0
        }

    })
)

module.exports = User