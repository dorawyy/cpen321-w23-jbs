const mongoose = require("mongoose");
const { UserType } = require("../constants/user.types");

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
        googleOauth: oauthSchema,
        type: [UserType.TUTEE, UserType.TUTOR, UserType.ADMIN],
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
        locationMode: String,
        location: locationSchema
    })
)

module.exports = User