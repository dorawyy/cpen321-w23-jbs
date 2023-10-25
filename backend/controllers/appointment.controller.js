const { AppointmentStatus } = require("../constants/appointment.status");
const db = require("../db")
const { google } = require('googleapis');

const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;

const oauth2Client = new google.auth.OAuth2(googleClientId, googleClientSecret)


const User = db.user
const Appointment = db.appointment


exports.bookAppointment = (req, res) => {

}

async function checkTutorManualAvailability( 
    tutor, tutee, newAppointment
) {
    // remove completed appointments. upcomingAppointments includes
    // pending/accepted appointments
    var upcomingAppointments = tutor.appointments.filter(
        async appt => {await !appointmentIsCompleted(appt.id)}
    )

    var acceptedAppointments = upcomingAppointments.filter(
        async appt => { await appointmentIsAccepted(appt.id) }
    )
    
    var conflicts = acceptedAppointments.filter(
        appt => {
            if (newAppointment.pstEndDatetime <= appt.pstStartDatetime || 
                newAppointment.pstStartDatetime >= appt.pstEndDatetime) {
                // non conflicts
                return False        
            } else {
                return True
            }
        } 
    )
    
    // if (conflicts.length === 0) {
    //     var newAppt = await new Appointment({
    //         status: AppointmentStatus.PENDING,
    //         participantsInfo: [
    //             {
    //                 userId: tutor._id,
    //             },
    //             {
    //                 userId: tutee._id
    //             }
    //         ],
    //         ...newAppointment
    //     }).save()
        
    //     var userNewAppt = {
    //         id: newAppt._id,
    //         pstStartDatetime: newAppt.pstStartDatetime,
    //         pstEndDatetime: newAppt.pstEndDatetime
    //     }
    //     tutor.appointments.push(userNewAppt)
    //     tutee.appointments.push(userNewAppt)
        
    //     tutor.save()
    //     tutee.save()
    // }
    return conflicts.length === 0

}

exports.appointmentIsCompleted = async (appointmentId) => {
    return Appointment
        .findById(appointmentId, "pstEndDatetime")
        .then(appt => {
            var pstNow = new Date().toLocaleString("en-US", {
                timeZone: "America/Los_Angeles"
            })
            
            if (pstEndDatetime > pstNow) {
                return Promise.resolve(false)
            } else {
                return Promise.resolve(true)
            }
        })        
}

exports.appointmentIsAccepted = async (appointmentId) => {
    var isCompleted = await Appointment
        .findById(appointmentId, "status")
        .then(appt => { return appt.status === AppointmentStatus.ACCEPTED })
    return isCompleted
}



// ChatGPT
async function checkTutorAvailabilityWithGoogleCalendar(
    tutorUser, pstStartDatetime, pstEndDatetime
) {
    oauth2Client.setCredentials({
        access_token: tutorUser.googleOauth.accessToken,
        refresh_token: tutorUser.googleOauth.refreshToken,
        expiry_date: Number(tutorUser.googleOauth.expiryDate)
    })

    google.options({ auth: oauth2Client });
    const calendar = google.calendar({ version: 'v3' });

    // Specify the time range for the query
    const timeMin = new Date(pstStartDatetime).toISOString();
    const timeMax = new Date(pstEndDatetime).toISOString();

    // Make a request to the Google Calendar API to list events within the specified time range
    const response = await calendar.events.list({
        calendarId: 'primary', // Assuming primary calendar for the tutor
        timeMin,
        timeMax,
        timeZone: 'America/Los_Angeles', // Adjust the time zone as needed
    });
    const events = response.data.items;

    // Check if there are any events within the specified time range
    return events.length === 0;
}