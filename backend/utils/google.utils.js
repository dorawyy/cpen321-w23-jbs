const { google } = require('googleapis');
const db = require("../db")
const momenttz = require("moment-timezone")

const User = db.user

const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const redirectUri = "https://edumatch.canadacentral.cloudapp.azure.com/redirect";


const OAuth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    redirectUri  // Use a placeholder redirect_uri
);

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

    // Make a request to the Google Calendar API to list events within the specified time range
    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: canceledAppt.pstStartDatetime,
        timeMax: canceledAppt.pstEndDatetime,
        timeZone: 'America/Los_Angeles',
        q: `Appointment with ${otherUser.username}`
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
        summary: `Appointment with ${otherUser.username}`,
        location: newAppt.location,
        description: `Course: ${newAppt.course}. Notes: ${newAppt.notes}`,
        start: { 
            dateTime: newAppt.pstStartDatetime, 
            timeZone: 'America/Los_Angeles',
        },
        end: { 
            dateTime: newAppt.pstEndDatetime, 
            timeZone: 'America/Los_Angeles',
        },
    };
    
    const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
    })

    await saveNewAccessToken(
        user, 
        OAuth2Client.credentials.access_token, 
        OAuth2Client.credentials.expiry_date
    )
}

// chatgpt
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
          timeZone: 'America/Los_Angeles',
          items: [{ id: calendarId }],
        },
    });

    const busyTimes = response.data.calendars[calendarId].busy;
    var freeTimes = []

    // Include free time before the first busy period
    const firstBusyStart = momenttz(busyTimes[0].start)
                            .tz('America/Los_Angeles');
    const startDateTime = momenttz(timeMin).tz('America/Los_Angeles');
    if (firstBusyStart.isSameOrAfter(startDateTime)) {
        const freeStart = startDateTime.toISOString(true);
        const freeEnd = firstBusyStart.toISOString(true);
        freeTimes.push({ start: freeStart, end: freeEnd });
    }

    // Infer free times based on busy intervals
    for (let i = 0; i < busyTimes.length - 1; i++) {
        const busyEnd = momenttz(busyTimes[i].end);
        const nextBusyStart = momenttz(busyTimes[i + 1].start);
    
        const freeStart = busyEnd.toISOString(true);
        const freeEnd = nextBusyStart.toISOString(true);
        freeTimes.push({ start: freeStart, end: freeEnd });
    }

    // Include free time after the last busy period
    const lastBusyEnd = momenttz(busyTimes[busyTimes.length - 1].end);
    const endDateTime = momenttz(timeMax)
    if (lastBusyEnd.isSameOrBefore(endDateTime)) {
        const freeStart = lastBusyEnd.toISOString(true);
        const freeEnd = endDateTime.toISOString(true);
        freeTimes.push({ start: freeStart, end: freeEnd });
    }

    await saveNewAccessToken(
        user, 
        OAuth2Client.credentials.access_token, 
        OAuth2Client.credentials.expiry_date
    )
    return freeTimes
}

// chatgpt
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
        timeZone: 'America/Los_Angeles',
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