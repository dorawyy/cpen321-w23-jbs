const request = require('supertest');
const mockMongoose = require("mongoose")
const mockMoment = require("moment-timezone")
const db = require("../../../db");
const { authJwt, account } = require("../../../middleware")
const mockGoogleUtils = require("../../../utils/google.utils")

const { app } = require('../../utils/express.mock.utils');
const { PST_TIMEZONE, AppointmentStatus } = require('../../../constants/appointment.status');
const { mockGetOverallRating } = require('../../utils/rating.utils');
const { MOCKED_VALUES } = require('../../utils/googleapis.mock.utils');
const { UserType } = require('../../../constants/user.types');
const { google } = require('googleapis');

const ENDPOINT = "/appointment/bookAppointment"

var mockErrorMsg
var mockAddedAppts = []
var mockAddedUsers = []
var mockUnableToCreateUser = false
var mockUnableToUpdate = false
const MOCK_PST_TIMEZONE = PST_TIMEZONE
const MockAppointmentStatus = AppointmentStatus
// ChatGPT Usage: No
jest.mock('googleapis', () => {
    return {
        google: {
            auth: {
                OAuth2: jest.fn(() => {
                    return {
                        setCredentials: jest.fn(),
                        credentials: {
                            access_token: "access token",
                            expiryDate: "123456789"
                        }
                    }
                })
            },
            options: jest.fn(),
            calendar: jest.fn(() => {
                return {
                    events: {
                        list: jest.fn((query) => {
                            var timeMin = mockMoment(query.timeMin)
                                .tz(MOCK_PST_TIMEZONE)
                            var timeMax = mockMoment(query.timeMax)
                                .tz(MOCK_PST_TIMEZONE)
                            var events = mockAddedAppts.filter(appt => {
                                var startTimeIsWithin = mockMoment(appt.pstStartDatetime)
                                    .tz(MOCK_PST_TIMEZONE)
                                    .isBetween(timeMin, timeMax)
                                var endTimeIsWithin = mockMoment(appt.pstEndDatetime)
                                    .tz(MOCK_PST_TIMEZONE)
                                    .isBetween(timeMin, timeMax)
                                return ((startTimeIsWithin || endTimeIsWithin) && 
                                        appt.status === MockAppointmentStatus.ACCEPTED)

                            })
                            return Promise.resolve({
                                data: {
                                    items: events
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
        static updateMany = jest.fn((query, push) => {
            var ids = query._id.$in
            for (var i = 0; i < mockAddedUsers.length; i++) {
                if (ids.includes(mockAddedUsers[i]._id.toString())) {
                    mockAddedUsers[i].appointments.push(push.$push.appointments)
                }
            }
        })

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
        static updateMany = jest.fn((query, data) => {
            var overlapIds = query._id.$in.map(id => id.toString())
            var apptId = query._id.$ne
            for (var i = 0; i < mockAddedAppts.length; i++) {
                var appt = mockAddedAppts[i]
                if (appt instanceof MockAppointment) {
                    appt = appt.toObject()
                }
                if (overlapIds.includes(appt._id.toString()) && 
                    appt._id.toString() !== apptId) {
                    mockAddedAppts[i] = {
                        ...appt,
                        ...data
                    }
                }
            }
        })
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
            if (mockUnableToUpdate) {
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

const User = db.user
const Appointment = db.appointment

const mockTutorId = new mockMongoose.Types.ObjectId()
const mockTuteeId = new mockMongoose.Types.ObjectId() 
beforeEach(() => {
    mockUnableToCreateUser = false
    mockUnableToUpdate = false
    mockErrorMsg = undefined
    mockAddedAppts = []
    mockAddedUsers = []
    var mockUser = {
        _id: mockTutorId,
        isBanned: false,
        type: UserType.TUTOR,
        useGoogleCalendar: true,
        googleOauth: {
            accessToken: "access token",
            refreshToken: "refresh token",
            expiryDate: "123456789"
        }
    }

    var otherUser = {
        _id: mockTuteeId,
        isBanned: false,
        type: UserType.TUTEE,
        useGoogleCalendar: true,
        googleOauth: {
            accessToken: "access token",
            refreshToken: "refresh token",
            expiryDate: "123456789"
        }
    } 

    var mockUserAppts = []

    // i = 1: first appointment is a past appointment
    // i = 2: a future canceled appointment
    // i = 3 -> 4: future pending appointments 
    // i = 5: future accepted appointment 
    for (var i = 1; i <= 5; i++) {
        var start =  mockMoment().tz(PST_TIMEZONE)
        var end

        if (i == 1) {
            start = start.clone().subtract(i, 'days')
        } else {
            start = start.clone().add(i, 'days')
        }
        
        end = start.clone().add(2, 'hours')
        var appt = {
            _id: new mockMongoose.Types.ObjectId(),
            pstStartDatetime: start.toISOString(true),
            pstEndDatetime: end.toISOString(true),   
        }
        mockUserAppts.push(appt)
        var status = AppointmentStatus.PENDING
        if (i == 2) {
            status = AppointmentStatus.CANCELED
        } else if (i == 5) {
            status = AppointmentStatus.ACCEPTED
        }
        appt = {
            ...appt, 
            participantsInfo: [
                { userId: mockUser._id.toString() },
                { userId: otherUser._id.toString() },
            ],
            course: `test course ${i}`,
            location: `test location ${i}`,
            status,
            notes: "blablabla"
        }
        mockAddedAppts.push(appt)
        
    }
    
    var mockTutor = {
        ...mockUser,
        appointments: mockUserAppts
    }
    var mockTutee =  {
        ...otherUser,
        appointments: mockUserAppts
    }

    mockAddedUsers.push(mockTutor, mockTutee)
})

const tutorId = mockTutorId.toString()
const tuteeId = mockTuteeId.toString()

// Assuming valid token
authJwt.verifyJwt.mockImplementation((req, res, next) => {
    req.userId = mockAddedUsers[1]._id.toString()
    return next()
})

// User is not banned
account.verifyAccountStatus.mockImplementation((req, res, next) => {
    return next()
})

// Interface POST https://edumatch.canadacentral.cloudapp.azure.com/appointment/bookAppointment
describe("Book an appointment for Google calendar users", () => {


    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutee
    //  (2) tutorId for a unbanned tutor
    //  (3) pstStartDatetime: valid appointment start datetime
    //  (4) pstEndDatetime: valid appointment end datetime
    // Expected status code: 200
    // Expected behavior: Creates a new appointment for both users 
    // Clean up user's appointments
    // Expected output: The new appointment
    test("Should book appointment successfully if there is no conflict", async () => {
        var date = mockMoment()
            .tz(PST_TIMEZONE)
            .add(6, "days")
            .format("YYYY-MM-DD")

        var tzOffset = mockMoment(date)
            .tz(PST_TIMEZONE)
            .format('Z')
        
        const pstStartDatetime = `${date}T13:00:00${tzOffset}`
        const pstEndDatetime = `${date}T15:00:00${tzOffset}`

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send({ 
                tutorId, pstStartDatetime, pstEndDatetime
            });

        expect(res.status).toBe(200)
        var newAppt = res.body
        expect(newAppt.pstStartDatetime).toEqual(pstStartDatetime)
        expect(newAppt.pstEndDatetime).toEqual(pstEndDatetime)
        expect(newAppt.status).toBe(AppointmentStatus.PENDING)
        for (var participant of newAppt.participantsInfo) {
            expect([tutorId, tuteeId].includes(participant.userId)).toBeTruthy()
        }
    })

    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutee
    //  (2) tutorId for a unbanned tutor
    //  (3) pstStartDatetime: start time that conflicted with an accepted appointment
    //  (4) pstEndDatetime: valid appointment end datetime
    // Expected status code: 400
    // Expected behavior: Check for tutor's availability and forbid tutee from booking
    // Expected output: inform message
    test("Should return 400 if tutor is unavailable", async () => {
        const pstStartDatetime = mockAddedAppts[4].pstStartDatetime
        const pstEndDatetime = mockAddedAppts[4].pstEndDatetime
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send({ 
                tutorId, pstStartDatetime, pstEndDatetime
            });
        
        expect(res.status).toBe(400)
        expect(res.body).toEqual({
            message:  "Tutor is unavailable during the specified time slot."
        })
        expect(mockAddedAppts.length).toBe(5)
    })

    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutee
    //  (2) tutorId for a unbanned tutor
    //  (3) pstStartDatetime: start time that conflicted with tutee's pending appointment
    //  (4) pstEndDatetime: valid appointment end datetime
    // Expected status code: 400
    // Expected behavior: Check for tutee's availability and forbid tutee from booking
    // Expected output: inform message
    test("Should return 400 if tutee is unavailable", async () => {
        const pstStartDatetime = mockAddedAppts[3].pstStartDatetime
        const pstEndDatetime = mockAddedAppts[3].pstEndDatetime
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send({ 
                tutorId, pstStartDatetime, pstEndDatetime
            });
        
        expect(res.status).toBe(400)
        expect(res.body).toEqual({
            message:  "You already have a pending/accepted appointment during the specified time slot."
        })
        expect(mockAddedAppts.length).toBe(5)
    })

    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutor
    //  (2) tutorId for a unbanned tutor
    //  (3) pstStartDatetime: valid appointment start time 
    //  (4) pstEndDatetime: valid appointment end datetime
    // Expected status code: 403
    // Expected behavior: forbid user from booking
    // Expected output: inform message
    test("Should forbid any non-tutee users from booking appointments", async () => {
        authJwt.verifyJwt.mockImplementationOnce((req, res, next) => {
            req.userId = mockTutorId.toString()
            return next()
        })
        const pstStartDatetime = mockAddedAppts[3].pstStartDatetime
        const pstEndDatetime = mockAddedAppts[3].pstEndDatetime
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send({ 
                tutorId, pstStartDatetime, pstEndDatetime
            });
    
        expect(res.status).toBe(403)
        expect(res.body).toEqual({
            message:  "Only tutee is allowed to book appointments"
        })
        expect(mockAddedAppts.length).toBe(5)
    })

    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutor
    //  (2) tutorId for a banned tutor
    //  (3) pstStartDatetime: valid appointment start time 
    //  (4) pstEndDatetime: valid appointment end datetime
    // Expected status code: 404
    // Expected behavior: forbid user from booking
    // Expected output: inform message
    test("Should return 404 if tutor is banned", async () => {
        mockAddedUsers[0].isBanned = true
        const pstStartDatetime = mockAddedAppts[3].pstStartDatetime
        const pstEndDatetime = mockAddedAppts[3].pstEndDatetime
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send({ 
                tutorId, pstStartDatetime, pstEndDatetime
            });

        expect(res.status).toBe(404)
        expect(res.body).toEqual({
            message: "Tutor is not found."
        })
        expect(mockAddedAppts.length).toBe(5)
    })

    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutor
    //  (2) tutorId for an unbanned tutor
    //  (3) pstStartDatetime: valid appointment start time 
    //  (4) pstEndDatetime: valid appointment end datetime
    // Expected status code: 500
    // Expected behavior: catch error
    // Expected output: error message
    test("Should return 500 for a database error", async () => {
        const errorMessage = "Database error"
        User.findById.mockRejectedValueOnce(new Error(errorMessage))

        const pstStartDatetime = mockAddedAppts[3].pstStartDatetime
        const pstEndDatetime = mockAddedAppts[3].pstEndDatetime
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send({ 
                tutorId, pstStartDatetime, pstEndDatetime
            });

        expect(res.status).toBe(500)
        expect(res.body).toEqual({
            message: errorMessage
        })
        expect(mockAddedAppts.length).toBe(5)
    })

})

describe("Book appointment for a manually-signed-up user", () => {
    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutee
    //  (2) tutorId for a unbanned tutor
    //  (3) pstStartDatetime: valid appointment start datetime
    //  (4) pstEndDatetime: valid appointment end datetime
    // Expected status code: 200
    // Expected behavior: Creates a new appointment for both users 
    // Clean up user's appointments
    // Expected output: The new appointment
    test("Should book appointment successfully if there is no conflict for tutor", async () => {
        var originalAddedApts = [...mockAddedAppts]
        for (var i = 0; i < 4; i++) {
            mockAddedAppts = originalAddedApts
            var date = mockMoment()
                .tz(PST_TIMEZONE)
                .add(7 + i, "days")
        
            for (var j = 0; j < mockAddedUsers.length; j++) {
                mockAddedUsers[j].useGoogleCalendar = false
                mockAddedUsers[j].manualAvailability = [{
                    day: date.format("dddd"),
                    startTime: "08:00",
                    endTime: "19:00"
                }]
            }
            // no appointments
            if (i == 1) {
                mockAddedUsers[0].appointments = []
            } else if (i == 2) {
                // past appointment
                mockAddedUsers[0].appointments = [mockAddedAppts[0]]
            } else if (i == 3) {
                mockAddedAppts[4].status = AppointmentStatus.PENDING
            }
            date = date.format("YYYY-MM-DD")

            var tzOffset = mockMoment(date)
                .tz(PST_TIMEZONE)
                .format('Z')
            
            const pstStartDatetime = `${date}T13:00:00${tzOffset}`
            const pstEndDatetime = `${date}T15:00:00${tzOffset}`

            const res = await request(app)
                .post(ENDPOINT)
                .set('Authorization', 'Bearer mockToken')
                .send({ 
                    tutorId, pstStartDatetime, pstEndDatetime
                });
            
            expect(res.status).toBe(200)
            var newAppt = res.body
            expect(newAppt.pstStartDatetime).toEqual(pstStartDatetime)
            expect(newAppt.pstEndDatetime).toEqual(pstEndDatetime)
            expect(newAppt.status).toBe(AppointmentStatus.PENDING)
            for (var participant of newAppt.participantsInfo) {
                expect([tutorId, tuteeId].includes(participant.userId)).toBeTruthy()
            }
            expect(google.auth.OAuth2).not.toHaveBeenCalled()
        }
    })

    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutee
    //  (2) tutorId for a unbanned tutor
    //  (3) pstStartDatetime: start datetime that isn't part of tutor's availabiltiy
    //  (4) pstEndDatetime: valid appointment end datetime
    // Expected status code: 400
    // Expected behavior: detect tutor's unvailable
    // Expected output: inform message
    test("Should return tutor unavailable if the requested day is not in tutor's manual availabilities", async () => {
        var date = mockMoment()
            .tz(PST_TIMEZONE)
            .add(6, "days")
    
        for (var i = 0; i < mockAddedUsers.length; i++) {
            mockAddedUsers[i].useGoogleCalendar = false
            mockAddedUsers[i].manualAvailability = [{
                day: date.clone().add(1, "days").format("dddd"),
                startTime: "08:00",
                endTime: "19:00"
            }]
        }
        date = date.format("YYYY-MM-DD")

        var tzOffset = mockMoment(date)
            .tz(PST_TIMEZONE)
            .format('Z')
        
        const pstStartDatetime = `${date}T13:00:00${tzOffset}`
        const pstEndDatetime = `${date}T15:00:00${tzOffset}`

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send({ 
                tutorId, pstStartDatetime, pstEndDatetime
            });
        
        expect(res.status).toBe(400)
        expect(res.body).toEqual({
            message: "Tutor is unavailable during the specified time slot."
        })
        expect(google.auth.OAuth2).not.toHaveBeenCalled()

    })

    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutee
    //  (2) tutorId for a unbanned tutor
    //  (3) pstStartDatetime: start datetime that conflicts with tutee's pending appointment
    //  (4) pstEndDatetime: valid appointment end datetime
    // Expected status code: 400
    // Expected behavior: detect tutee's unvailable
    // Expected output: inform message
    test("Should return tutee unavailable if there is conflict pending appointment for tutee", async () => {
        var date = mockMoment(mockAddedAppts[3].pstStartDatetime)
            .tz(PST_TIMEZONE)
    
        for (var i = 0; i < mockAddedUsers.length; i++) {
            mockAddedUsers[i].useGoogleCalendar = false
            mockAddedUsers[i].manualAvailability = [{
                day: date.format("dddd"),
                startTime: "00:00",
                endTime: "23:59"
            }]
        }

        date = date.format("YYYY-MM-DD")

        var tzOffset = mockMoment(date)
            .tz(PST_TIMEZONE)
            .format('Z')
        
        const pstStartDatetime = mockAddedAppts[3].pstStartDatetime
        const pstEndDatetime = mockAddedAppts[3].pstEndDatetime

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send({ 
                tutorId, pstStartDatetime, pstEndDatetime
            });

        expect(res.status).toBe(400)
        expect(res.body).toEqual({
            message: "You already have a pending/accepted appointment during the specified time slot."
        })
        expect(google.auth.OAuth2).not.toHaveBeenCalled()
    })
})