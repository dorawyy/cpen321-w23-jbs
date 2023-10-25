const mongoose = require("mongoose");
const { UserType } = require("../constants/user.types");
const { LocationMode } = require("../constants/location.modes");
const { AppointmentStatus } = require("../constants/appointment.status");

const participantsInfoSchema = new mongoose.Schema({
    userId: String,
    noShow: Boolean,
    late: Boolean,
})

const Appointment = mongoose.model(
    "Appointment",
    new mongoose.Schema({
        status: Boolean,
        participantsInfo: [
            {
                type: participantsInfoSchema
            }
        ],
        course: String,
        pstStartDatetime: {
            type: Date,
            require: true
        },
        pstEndDatetime: {
            type: Date,
            require: true
        },
        location: String,
        status:  {
            type: String,
            enum: Object.values(AppointmentStatus)
        },
        notes: String
    }, { timestamps: true })
)

module.exports = Appointment