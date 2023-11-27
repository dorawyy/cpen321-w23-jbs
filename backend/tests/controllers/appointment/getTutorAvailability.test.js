const request = require('supertest');
const mockMongoose = require("mongoose")
const momenttz = require("moment-timezone")
const db = require("../../../db");
const { authJwt, account } = require("../../../middleware")
const { google } = require('googleapis');

const googleUtils = require("../../../utils/google.utils")

const { app } = require('../../utils/express.mock.utils');
const { PST_TIMEZONE, AppointmentStatus } = require('../../../constants/appointment.status');
const { mockGetOverallRating } = require('../../utils/rating.utils');
const { MOCKED_VALUES } = require('../../utils/googleapis.mock.utils');
const { UserType } = require('../../../constants/user.types');
const { default: mongoose } = require('mongoose');

const ENDPOINT = "/user/availability"

var mockErrorMsg
var mockAddedAppts = []
var mockAddedUsers = []
var mockUnableToCreateUser = false
var mockUnableToUpdate = false
var mockNoBusy = false

// ChatGPT Usage: No
jest.mock('googleapis', () => {
    return {
        google: {
            auth: {
                OAuth2: jest.fn(() => {
                    return {
                        setCredentials: jest.fn()
                    }
                })
            },
            options: jest.fn(),
            calendar: jest.fn(() => {
                return {
                    freebusy: {
                        query: jest.fn((requestBody) => {
                            if (mockNoBusy) {
                                return Promise.resolve({
                                    data: {
                                        calendars: {
                                            primary: {
                                                busy: []
                                            }
                                        }
                                    }
                                })
                            }
                            var busyTime = mockGenerateRandomTimePeriod(
                                requestBody.timeMin,
                                requestBody.timeMax,
                                true
                            )
                            return Promise.resolve({
                                data: {
                                    calendars: {
                                        primary: {
                                            busy: [busyTime]
                                        }
                                    }
                                }
                            })
                            
                        })
                    }
                }
            })
        }
        
    } 
})

// ChatGPT Usage: Partial
jest.mock('../../../db', () => {
    const originalDb = jest.requireActual('../../../db')
    class MockUser extends originalDb.user {
        static findById = jest.fn((id, ...args) => {
            var queryId = id
            if (!(id instanceof mockMongoose.Types.ObjectId)) {
                queryId = new mockMongoose.Types.ObjectId(id)
            }
            return Promise.resolve(
                mockAddedUsers.find(appt => appt._id.equals(queryId))
            )
        })
        static findOne = jest.fn()

        static findByIdAndUpdate = jest.fn((id, data) => {
            if (mockErrorMsg) {
                return Promise.reject(new Error(mockErrorMsg))
            }
            var queryId = id
            if (!(id instanceof mockMongoose.Types.ObjectId)) {
                queryId = new mockMongoose.Types.ObjectId(id)
            }
            var userIndex = mockAddedUsers.findIndex(user => user._id.equals(queryId))
            mockAddedUsers[userIndex] = {
                ...mockAddedUsers[userIndex],
                ...data
            }
            return Promise.resolve(mockAddedUsers[userIndex])
        })

        save = jest.fn(() => {
            if (mockErrorMsg) {
                return Promise.reject(new Error(mockErrorMsg))
            }
            if (mockUnableToCreateUser) {
                return Promise.resolve(undefined)
            }
            mockAddedUsers.push(this)
            return Promise.resolve(this)
        })

    }
    class MockAppointment extends originalDb.appointment {
        static findById = jest.fn((id, ...args) => {
            var queryId = id
            if (!(id instanceof mockMongoose.Types.ObjectId)) {
                queryId = new mockMongoose.Types.ObjectId(id)
            }
            return Promise.resolve(
                mockAddedAppts.find(appt => appt._id.equals(queryId))
            )
        })
        static findOne = jest.fn()

        static findByIdAndUpdate = jest.fn((id, data) => {
            if (mockErrorMsg) {
                return Promise.reject(new Error(mockErrorMsg))
            }
            if (mockUnableToUpdate) {
                return Promise.resolve(undefined)
            }
            var queryId = id
            if (!(id instanceof mockMongoose.Types.ObjectId)) {
                queryId = new mockMongoose.Types.ObjectId(id)
            }
            var apptIndex = mockAddedAppts.findIndex(appt => appt._id.equals(queryId))
            mockAddedAppts[apptIndex] = {
                ...mockAddedAppts[apptIndex],
                ...data
            }
            return Promise.resolve(mockAddedAppts[apptIndex])
        })

        save = jest.fn(() => {
            if (mockErrorMsg) {
                return Promise.reject(new Error(mockErrorMsg))
            }
            if (mockUnableToCreateUser) {
                return Promise.resolve(undefined)
            }
            mockAddedAppts.push(this)
            return Promise.resolve(this)
        })

    }
    var mockDb = {
        user: MockUser,
        appointment: MockAppointment
    }
    return mockDb
})

jest.mock("../../../middleware")

const mockUserId = new mockMongoose.Types.ObjectId()
beforeEach(() => {
    mockUnableToCreateUser = false
    mockUnableToUpdate = false
    mockErrorMsg = undefined
    mockAddedAppts = []
    mockAddedUsers = []
    mockNoBusy = false
})


const User = db.user
const Appointment = db.appointment

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/user/availability?userId=123&date="2023-12-25"
describe("Get tutor availability for a Google Calendar user", () => {
    // ChatGPT Usage: No
    // Input: valid date and userId
    // Expected status code: 200
    // Expected behavior: Find user's free time blocks for the queried date
    // Expected output: List of free time blocks for the queried date
    test("Should return correct availability for a valid date and userId", async () => {
        var mockUser = {
            _id: new mongoose.Types.ObjectId(),
            googleOauth: {
                accessToken: 'fakeAccessToken',
                refreshToken: 'fakeRefreshToken',
                expiryDate: 'fakeExpiryDate',
            },
            isBanned: false,
            useGoogleCalendar: true
        }
        User.findById.mockResolvedValueOnce(mockUser)

        var userId = mockUser._id.toString()
        var date = momenttz().tz(PST_TIMEZONE).format('YYYY-MM-DD')

        var tzOffset = momenttz(date)
            .tz(PST_TIMEZONE)
            .format('Z')

        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId, date })
        const expectedAvail = [
            {
                end: `${date}T15:00:00.000${tzOffset}`,
                start: `${date}T08:00:00.000${tzOffset}`,
                
            },
            {
                end: `${date}T19:00:00.000${tzOffset}`,
                start: `${date}T17:00:00.000${tzOffset}`,
                
            }
        ]
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            availability: expectedAvail
        })
    })

    // ChatGPT Usage: No
    // Input: valid userId, empty date
    // Expected status code: 400
    // Expected behavior: detect empty queries
    // Expected output: failure message
    test("Should return 400 if either userId or date is not set", async () => {
        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: "blah" })
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("message")
    })

    // ChatGPT Usage: No
    // Input: valid date and userId
    // Expected status code: 200
    // Expected behavior: Returns the default free time blocks (08:00-19:00)
    // Expected output: free time block from 08:00 to 19:00
    test("Should return 08:00-19:00 for the current date when there is no busy blocks", async () => {
        var mockUser = {
            _id: new mongoose.Types.ObjectId(),
            googleOauth: {
                accessToken: 'fakeAccessToken',
                refreshToken: 'fakeRefreshToken',
                expiryDate: 'fakeExpiryDate',
            },
            isBanned: false,
            useGoogleCalendar: true
        }
        User.findById.mockResolvedValueOnce(mockUser)

        var userId = mockUser._id.toString()
        var date = momenttz().tz(PST_TIMEZONE).format('YYYY-MM-DD')

        var tzOffset = momenttz(date)
            .tz(PST_TIMEZONE)
            .format('Z')

        mockNoBusy = true
        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId, date })

        const expectedAvail = [
            {
                end: `${date}T19:00:00.000${tzOffset}`,
                start: `${date}T08:00:00.000${tzOffset}`,
                
            }
        ]

        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            availability: expectedAvail
        })
    })
})

describe("Get tutor availability for a manually-signed-up user", () => {
    // ChatGPT Usage: No
    // Input: valid date and userId of a manually-signed-up user
    // Expected status code: 200
    // Expected behavior: Find user's free time blocks for the queried date
    // using their manual availability
    // Expected output: List of free time blocks for the queried date
    test("Should return correct availability for a valid date and userId", async () => {
        var date = momenttz()
            .tz(PST_TIMEZONE)
            .add(1, "days")

        var mockUser = {
            _id: new mongoose.Types.ObjectId(),
            isBanned: false,
            useGoogleCalendar: false,
            manualAvailability: [
                {
                    day: date.format("dddd"),
                    startTime: "08:00",
                    endTime: "16:00"
                }
            ]
        }

        date = date.format('YYYY-MM-DD')
        var tzOffset = momenttz(date)
            .tz(PST_TIMEZONE)
            .format('Z')

        var start =  momenttz(`${date}T13:00:00${tzOffset}`).tz(PST_TIMEZONE)
        var end = momenttz(`${date}T15:00:00${tzOffset}`).tz(PST_TIMEZONE)
        var mockUserAppts = []

        var appt = {
            _id: new mockMongoose.Types.ObjectId(),
            pstStartDatetime: start.toISOString(true),
            pstEndDatetime: end.toISOString(true),   
        }
        mockUserAppts.push(appt)
        appt = {
            ...appt, 
            participantsInfo: [
                { userId: mockUser._id.toString() },
                { userId: "other-user-id" },
            ],
            status: AppointmentStatus.ACCEPTED,
        }
        mockAddedAppts.push(appt)

        mockUser.appointments = mockUserAppts

        User.findById.mockResolvedValueOnce(mockUser)

        var userId = mockUser._id.toString()

        var tzOffset = momenttz(date)
            .tz(PST_TIMEZONE)
            .format('Z')

        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId, date })

        const expectedAvail = [
            {
                end: `${date}T13:00:00.000${tzOffset}`,
                start: `${date}T08:00:00.000${tzOffset}`,
            },
            {
                end: `${date}T16:00:00.000${tzOffset}`,
                start: `${date}T15:00:00.000${tzOffset}`,
            }
        ]
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            availability: expectedAvail
        })
    })

    // ChatGPT Usage: No
    // Input: valid date and userId of a manually-signed-up user
    // Expected status code: 200
    // Expected behavior: default free time blocks
    // Expected output: free time block from 08:00 to 19:00
    test("Should return the default free times if user's manual availability is not set", async () => {
        var mockUser = {
            _id: new mongoose.Types.ObjectId(),
            isBanned: false,
            useGoogleCalendar: false,
        }
        User.findById.mockResolvedValueOnce(mockUser)
        var userId = mockUser._id.toString()
        var date = momenttz().tz(PST_TIMEZONE).format('YYYY-MM-DD')

        var tzOffset = momenttz(date)
            .tz(PST_TIMEZONE)
            .format('Z')

        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId, date })

        const expectedAvail = [
            {
                end: `${date}T19:00:00.000${tzOffset}`,
                start: `${date}T08:00:00.000${tzOffset}`,
                
            }
        ]
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            availability: expectedAvail
        })
    })

    // ChatGPT Usage: No
    // Input: valid date and userId of a banned user
    // Expected status code: 404
    // Expected behavior: Detect the tutor is banned
    // Expected output: message saying user not found
    test("Should return 404 when the tutor is banned", async () => {
        var mockUser = {
            _id: new mongoose.Types.ObjectId(),
            isBanned: true,
        }
        var date = momenttz().tz(PST_TIMEZONE).format('YYYY-MM-DD')

        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: mockUser._id.toString(), date })
        
        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message")
    })

    // ChatGPT Usage: No
    // Input: valid date and userId of a manually-signed-up user
    // Expected status code: 500
    // Expected behavior: Catch the error and return 500 status code
    // Expected output: error message
    test("Should return 500 for a server error", async () => {
        const errorMessage = "Database error"
        User.findById.mockRejectedValueOnce(new Error(errorMessage))
        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: "user-id", date: "2023-25-12" })
        expect(res.status).toBe(500)
        expect(res.body).toEqual({
            message: errorMessage
        })
    })
})

function mockGenerateRandomTimePeriod(timeMin, timeMax, fromGoogle) {
    var tzOffset = momenttz(timeMin)
        .tz(PST_TIMEZONE)
        .format('Z')

    var date = momenttz(timeMin)
        .tz(PST_TIMEZONE)
        .format('YYYY-MM-DD')

    if (fromGoogle) {
        return {
            start: `${date}T15:00:00${tzOffset}`,
            end: `${date}T17:00:00${tzOffset}`,
        }
    }
    return {
        pstStartDatetime: `${date}T15:00:00${tzOffset}`,
        pstEndDatetime: `${date}T17:00:00${tzOffset}`,
    }
}