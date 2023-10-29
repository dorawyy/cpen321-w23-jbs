const { google } = require('googleapis');
const db = require("../db")

const User = db.user

const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const redirectUri = "https://edumatch.canadacentral.cloudapp.azure.com/redirect";


const OAuth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    redirectUri  // Use a placeholder redirect_uri
);

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

    // Make a request to the Google Calendar API to list events within the specified time range
    const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        timeZone: 'America/Los_Angeles',
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
    await User.findByIdAndUpdate(
        user._id,
        { $set: {
            googleOauth: {
                accessToken: newAccessToken,
                expiryDate: newExpiryDate
            }
        }}
    )
}