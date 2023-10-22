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

const manualAvailablitySchema = new mongoose.Schema({
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
        manualAvailablity: [
            {
                type: manualAvailablitySchema
            }
        ],
        locationMode: {
            type: String,
            enum: Object.values(LocationMode)
        },
        location: locationSchema,
        bio: String
    })
)

module.exports = User