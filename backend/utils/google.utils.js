const { google } = require('googleapis');
const db = require("../db")
const { getFreeTimeHelper } = require('./freetimes.utils');
const { PST_TIMEZONE } = require('../constants/appointment.status');

const User = db.user

const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const redirectUri = "https://edumatch.canadacentral.cloudapp.azure.com/redirect";


const OAuth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    redirectUri 
);

// ChatGPT usage: Partial
exports.cancelGoogleEvent = async (
    user, otherUser, canceledAppt
) => {
    OAuth2Client.setCredentials({
        access_token: user.googleOauth.accessToken,
        refresh_token: user.googleOauth.refreshToken,
        expiry_date: Number(user.googleOauth.expiryDate)
    })

    google.options({ auth: OAuth2Client });
    const calendar = google.calendar({ version: 'v3' });

    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: canceledAppt.pstStartDatetime,
        timeMax: canceledAppt.pstEndDatetime,
        timeZone: PST_TIMEZONE,
        q: `Appointment with ${otherUser.displayedName}`
    });
    const events = response.data.items;

    if (events.length > 0) {
        await calendar.events.delete({
            calendarId: 'primary', 
            eventId: events[0].id,
        });
    }

    await saveNewAccessToken(
        user, 
        OAuth2Client.credentials.access_token, 
        OAuth2Client.credentials.expiry_date
    )
}

// ChatGPT usage: Partial
exports.createGoogleEvent = async (
    user, otherUser, newAppt
) => {
    OAuth2Client.setCredentials({
        access_token: user.googleOauth.accessToken,
        refresh_token: user.googleOauth.refreshToken,
        expiry_date: Number(user.googleOauth.expiryDate)
    })

    google.options({ auth: OAuth2Client });
    const calendar = google.calendar({ version: 'v3' });

    const event = {
        summary: `Appointment with ${otherUser.displayedName}`,
        location: newAppt.location,
        description: `Course: ${newAppt.course}. Notes: ${newAppt.notes}`,
        start: { 
            dateTime: newAppt.pstStartDatetime, 
            timeZone: PST_TIMEZONE,
        },
        end: { 
            dateTime: newAppt.pstEndDatetime, 
            timeZone: PST_TIMEZONE,
        },
    };
    
    await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
    })

    await saveNewAccessToken(
        user, 
        OAuth2Client.credentials.access_token, 
        OAuth2Client.credentials.expiry_date
    )
}

// ChatGPT usage: Partial
exports.getFreeTime = async (
    user, timeMin, timeMax
) => {
    OAuth2Client.setCredentials({
        access_token: user.googleOauth.accessToken,
        refresh_token: user.googleOauth.refreshToken,
        expiry_date: Number(user.googleOauth.expiryDate)
    })

    google.options({ auth: OAuth2Client });
    const calendar = google.calendar({ version: 'v3' });
    const calendarId = 'primary'
    
    const response = await calendar.freebusy.query({
        requestBody: {
            timeMin,
            timeMax,
            timeZone: PST_TIMEZONE,
            items: [{ id: calendarId }],
        },
    });

    const busyTimes = response.data.calendars[calendarId].busy;
    return getFreeTimeHelper(timeMin, timeMax, busyTimes, true)
}

// ChatGPT usage: Partial
exports.getCalendarEvents = async (
    user, timeMin, timeMax
) => {
    OAuth2Client.setCredentials({
        access_token: user.googleOauth.accessToken,
        refresh_token: user.googleOauth.refreshToken,
        expiry_date: Number(user.googleOauth.expiryDate)
    })

    google.options({ auth: OAuth2Client });
    const calendar = google.calendar({ version: 'v3' });

    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        timeZone: PST_TIMEZONE,
        showDeleted: false,
        singleEvents: true
    });

    const events = response.data.items;
    await saveNewAccessToken(
        user, 
        OAuth2Client.credentials.access_token, 
        OAuth2Client.credentials.expiry_date
    )
    return events 
}

exports.getGoogleAccessTokens = async (authCode) => {
    const response = await OAuth2Client.getToken(authCode)
    return Promise.resolve(response.tokens)
}

async function saveNewAccessToken(user, newAccessToken, newExpiryDate) {
    var newGoogleOauth = {
        accessToken: newAccessToken,
        refreshToken: user.googleOauth.refreshToken,
        expiryDate: newExpiryDate
    }
    await User.findByIdAndUpdate(
        user._id,
        { googleOauth: newGoogleOauth }
    )
}