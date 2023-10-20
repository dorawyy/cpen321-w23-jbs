const mongoose = require("mongoose");
const { UserRole } = require("../constants/user.roles");

const educationSchema = new mongoose.Schema({
    school: String,
    program: String,
    level: Number,
    courses: [
        {
            type: String
        }
    ]
})

const subjectHourlyRateSchema = new mongoose.Schema({
    course: String,
    hourlyRate: Number
})

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        userId: String,
        googleId: String,
        role: [UserRole.TUTEE, UserRole.TUTOR],
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
        ] 

    })
)

module.exports = Tutee