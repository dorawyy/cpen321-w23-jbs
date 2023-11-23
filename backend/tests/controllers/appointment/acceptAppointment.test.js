const request = require('supertest');
const mockMongoose = require("mongoose")
const momenttz = require("moment-timezone")
const db = require("../../../db");
const { authJwt, account } = require("../../../middleware")
const googleUtils = require("../../../utils/google.utils")

const { app } = require('../../utils/express.mock.utils');
const { PST_TIMEZONE, AppointmentStatus } = require('../../../constants/appointment.status');
const { mockGetOverallRating } = require('../../utils/rating.utils');
const { MOCKED_VALUES } = require('../../utils/googleapis.mock.utils');
const { UserType } = require('../../../constants/user.types');

const ENDPOINT = "/appointment/accept"

var mockErrorMsg
var mockAddedAppts = []
var mockAddedUsers = []
var mockUnableToCreateUser = false
var mockUnableToUpdate = false

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
            // mockAddedAppts.push(this)
            return Promise.resolve(this)
        })

    }

    return {
        user: MockUser,
        appointment: MockAppointment
    }
})

jest.mock("../../../middleware")
jest.mock("../../../utils/google.utils", () => {
    return {
        createGoogleEvent: jest.fn()
    }
})
const User = db.user
const Appointment = db.appointment
const mockUserId = new mockMongoose.Types.ObjectId()
beforeEach(() => {
    mockUnableToCreateUser = false
    mockUnableToUpdate = false
    mockErrorMsg = undefined
    mockAddedAppts = []
    mockAddedUsers = []
    var mockUser = {
        _id: mockUserId,
        isBanned: false,
        type: UserType.TUTOR,
        useGoogleCalendar: true,
    }

    var otherUser = {
        _id: new mockMongoose.Types.ObjectId(),
        isBanned: false,
        type: UserType.TUTEE,
        useGoogleCalendar: true
    } 

    var mockUserAppts = []

    // i = 1: first appointment is a past appointment
    // i = 2: a future canceled appointment
    // i = 3 -> 4: future pending appointments 
    // i = 5: an overlap pending appointment with appointment 4 from a different user
    for (var i = 1; i <= 5; i++) {
        var start =  momenttz().tz(PST_TIMEZONE)
        var end

        if (i == 1) {
            start = start.clone().subtract(i, 'days')
        } else if (i == 5) {
            start = momenttz(mockAddedAppts[3].pstStartDatetime).tz(PST_TIMEZONE)
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
        appt = {
            ...appt, 
            participantsInfo: [
                { userId: mockUser._id.toString() },
                { userId: i == 5 ? "user-id-5" : otherUser._id.toString() },
            ],
            course: `test course ${i}`,
            location: `test location ${i}`,
            status: i == 2 ? AppointmentStatus.CANCELED : AppointmentStatus.PENDING,
            notes: "blablabla"
        }
        mockAddedAppts.push(appt)
        
    }
    
    var mockCurrentUser = {
        ...mockUser,
        appointments: mockUserAppts
    }
    var mockOtherUser =  {
        ...otherUser,
        appointments: mockUserAppts
    }

    mockAddedUsers.push(mockCurrentUser, mockOtherUser)
})


// Interface PUT https://edumatch.canadacentral.cloudapp.azure.com/appointment/accept?appointmentId=123
describe("Accept an appointment for a Google Calendar user", () => {
    // Assuming valid token
    authJwt.verifyJwt.mockImplementation((req, res, next) => {
        req.userId = mockUserId.toString()
        return next()
    })

    // User is not banned
    account.verifyAccountStatus.mockImplementation((req, res, next) => {
        return next()
    })

    // ChatGPT Usage: No
    // Input:
    //  (1) userId for a tutor 
    //  (2) appointmentId for an upcoming pending appointment
    // Expected status code: 200
    // Expected behavior: Set the status of the appointment to ACCEPTED. 
    // Clean up user's appointments
    // Expected output: Success message
    test("Should accept an upcoming pending appointment successfully for a valid tutor", async () => {
        // use the 4th appointment (pending appointment)
        mockAddedAppts[mockAddedAppts.length - 2] = new Appointment(
            mockAddedAppts[mockAddedAppts.length - 2]
        )
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 2]._id.toString()
            });

        expect(res.status).toBe(200)
        var acceptedAppt = mockAddedAppts[mockAddedAppts.length - 2]
        
        expect(acceptedAppt.status).toBe(AppointmentStatus.ACCEPTED)
        // the endpoint should remove the past/canceled/conflict with the accepted appointments
        var user = mockAddedUsers[0]
        expect(user.appointments.length).toBe(2)
        expect(
            user.appointments[0]._id
                .equals(mockAddedAppts[mockAddedAppts.length - 3]._id)
        ).toBeTruthy()
        expect(
            user.appointments[1]._id
                .equals(mockAddedAppts[mockAddedAppts.length - 2]._id)
        ).toBeTruthy()
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) userId of a tutor
    //  (2) appointmentId for a past appointment
    // Expected status code: 404
    // Expected behavior: Clean up user's appointments. The appointment
    // status is unchanged
    // Expected output: Message saying appointment is not found
    test("Should return 404 for accepting a past appointment", async () => {
        // use the first appointment to query (a past appointment)        
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[0]._id.toString()
            });

        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message")
        var appt = mockAddedAppts[0]
        expect(appt.status).not.toBe(AppointmentStatus.ACCEPTED)
        
        var currentUser = mockAddedUsers[0]
        // the endpoint should leave the 3 future pending appointments left for 
        // the current user
        expect(currentUser.appointments.length).toBe(3)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) userId of a tutee
    //  (2) appointmentId
    // Expected status code: 404
    // Expected behavior: Clean up user's appointments. The appointment
    // status is unchanged
    // Expected output: Message saying appointment is not found
    test("Should return 403 if tutee tries to accept appointment", async () => {
        authJwt.verifyJwt.mockImplementationOnce((req, res, next) => {
            req.userId = mockAddedUsers[1]._id.toString()
            return next()
        })
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[0]._id.toString()
            });
        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty("message")
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) userId for a tutor
    //  (2) appointmentId: null
    // Expected status code: 400
    // Expected behavior: Database unchanged
    // Expected output: Error message
    test("Should return 400 for empty appointmentId", async () => {
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
        
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("message")
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) userId for a tutor
    //  (2) appointmentId for an upcoming pending appointment with a banned tutee
    // Expected status code: 404
    // Expected behavior: Database unchanged
    // Expected output: Error message
    test("Should return 404 for accepting an appointment with a banned tutee", async () => {
        mockAddedUsers[1].isBanned = true
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 2]._id.toString()
            });

        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message")

        var acceptedAppt = mockAddedAppts[mockAddedAppts.length - 2]
        
        expect(acceptedAppt.status).not.toBe(AppointmentStatus.ACCEPTED)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) userId for a tutor
    //  (2) appointmentId for an upcoming pending appointment
    // Expected status code: 404
    // Expected behavior: Clean up user's appointments. The appointment
    // status is unchanged
    // Expected output: inform message
    test("Should return 404 if unable to update the appointment status due to some database issue", async () => {
        mockUnableToUpdate = true
        mockAddedAppts[mockAddedAppts.length - 2] = new Appointment(
            mockAddedAppts[mockAddedAppts.length - 2]
        )
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 2]._id.toString()
            });

        expect(res.status).toBe(404)
        expect(res.body).toEqual({
            message:  "Unable to update appointment. Appointment not found"
        })

        var canceledAppt = mockAddedAppts[mockAddedAppts.length - 1]
        expect(canceledAppt.status).not.toBe(AppointmentStatus.ACCEPTED)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) userId for a tutor
    //  (2) appointmentId for an upcoming pending appointment
    // Expected status code: 500
    // Expected behavior: Database unchanged
    // Expected output: Error message
    test("Should return 500 for a database error", async () => {
        const errorMessage = "Database error"
        Appointment.findById.mockRejectedValueOnce(new Error(errorMessage))
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 1]._id.toString()
            });

        expect(res.status).toBe(500)
        expect(res.body).toEqual({
            message: errorMessage
        })
        expect(mockAddedUsers[0].appointments.length).toBe(mockAddedAppts.length)
    })
})