import mongoose from "mongoose";
import AppointmentStatus from "../constants/appointment.status.js";

const participantsInfoSchema = new mongoose.Schema({
    userId: String,
    displayedName: String,
    noShow: Boolean,
    late: Boolean,
})

const Appointment = mongoose.model(
    "Appointment",
    new mongoose.Schema({
        participantsInfo: [
            {
                type: participantsInfoSchema
            }
        ],
        course: String,
        pstStartDatetime: {
            type: String,
            require: true
        },
        pstEndDatetime: {
            type: String,
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

export default Appointment;