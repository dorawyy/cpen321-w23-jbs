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
const { google } = require('googleapis');

const ENDPOINT = "/appointment/cancel"

var mockErrorMsg
var mockAddedAppts = []
var mockAddedUsers = []
var mockUnableToCreateUser = false
var mockUnableToUpdate = false
var mockAlreadyCanceled = false

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
                            var items = [{ id: "eventId" }]
                            if (mockAlreadyCanceled) {
                                items = []
                            }
                            return Promise.resolve({
                                data: {
                                    items
                                }
                            })
                        }),
                        delete: jest.fn()
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

    return {
        user: MockUser,
        appointment: MockAppointment
    }
})

jest.mock("../../../middleware")

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
        displayedName: "Tutor X",
        googleOauth: {
            accessToken: "access token",
            refreshToken: "refresh token",
            expiryDate: "123456789"
        }
    }

    var otherUser = {
        _id: new mockMongoose.Types.ObjectId(),
        isBanned: false,
        type: UserType.TUTEE,
        useGoogleCalendar: true,
        displayedName: "Tutee X",
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
    for (var i = 1; i <= 4; i++) {
        var start =  momenttz().tz(PST_TIMEZONE)
        var end

        if (i == 1) {
            start = start.subtract(i, 'days')
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
                { userId: otherUser._id.toString() },
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


const User = db.user
const Appointment = db.appointment

// Assuming valid token
authJwt.verifyJwt.mockImplementation((req, res, next) => {
    req.userId = mockUserId.toString()
    return next()
})

// User is not banned
account.verifyAccountStatus.mockImplementation((req, res, next) => {
    return next()
})

// Interface PUT https://edumatch.canadacentral.cloudapp.azure.com/appointment/cancel?appointmentId=123
describe("Cancel appointment for a Google Calendar user", () => {
    


    // ChatGPT Usage: No
    // Input: appointmentId for an upcoming pending/accepted appointment
    // Expected status code: 200
    // Expected behavior: Set the status of the appointment to CANCELED. 
    // Clean up user's appointments
    // Expected output: Success message
    test("Should cancel an upcoming pending/accepted appointment successfully", async () => {
        // use the last appointment (pending appointment)
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 1]._id.toString()
            });
        
        expect(res.status).toBe(200)
        var canceledAppt = mockAddedAppts[mockAddedAppts.length - 1]
        
        expect(canceledAppt.status).toBe(AppointmentStatus.CANCELED)
        // the endpoint should remove the past or canceled appointments
        for (var user of mockAddedUsers) {
            expect(user.appointments.length).toBe(1)
            expect(
                user.appointments[0]._id
                    .equals(mockAddedAppts[mockAddedAppts.length - 2]._id)
            ).toBeTruthy()
        }
    })

    // ChatGPT Usage: No
    // Input: appointmentId for an upcoming pending/accepted appointment
    // Expected status code: 200
    // Expected behavior: Set the status of the appointment to CANCELED. 
    // Clean up user's appointments
    // Expected output: Success message
    test("Should cancel an upcoming appointment successfully even if Google Calendar can't find the event", async () => {
        // use the last appointment (pending appointment)
        mockAlreadyCanceled = true
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 1]._id.toString()
            });
        
        expect(res.status).toBe(200)
        var canceledAppt = mockAddedAppts[mockAddedAppts.length - 1]
        
        expect(canceledAppt.status).toBe(AppointmentStatus.CANCELED)
        // the endpoint should remove the past or canceled appointments
        for (var user of mockAddedUsers) {
            expect(user.appointments.length).toBe(1)
            expect(
                user.appointments[0]._id
                    .equals(mockAddedAppts[mockAddedAppts.length - 2]._id)
            ).toBeTruthy()
        }
    })

    // ChatGPT Usage: No
    // Input: appointmentId for a past appointment
    // Expected status code: 404
    // Expected behavior: Clean up user's appointments. The appointment
    // status is unchanged
    // Expected output: Message saying appointment is not found
    test("Should return 404 for canceling a past appointment", async () => {
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
        expect(appt.status).not.toBe(AppointmentStatus.CANCELED)
        
        var currentUser = mockAddedUsers[0]
        // the endpoint should leave the 2 future pending appointments left for 
        // the current user
        expect(currentUser.appointments.length).toBe(2)
        expect(
            currentUser.appointments[1]._id
                .equals(mockAddedAppts[mockAddedAppts.length - 1]._id)
        ).toBeTruthy()
        expect(
            currentUser.appointments[0]._id
                .equals(mockAddedAppts[mockAddedAppts.length - 2]._id)
        ).toBeTruthy()
    })

    // ChatGPT Usage: No
    // Input: appointmentId for an upcoming canceled appointment
    // Expected status code: 404
    // Expected behavior: Clean up user's appointments. The appointment
    // status is unchanged
    // Expected output: Message saying appointment is not found
    test("Should return 404 for canceling an already canceled appointment", async () => {
        // use the 2nd appointment to query (a canceled appointment)
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[1]._id.toString()
            });

        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message")

        var currentUser = mockAddedUsers[0]
        // the endpoint should leave the 2 future pending appointments left for 
        // the current user
        expect(currentUser.appointments.length).toBe(2)
        expect(
            currentUser.appointments[1]._id
                .equals(mockAddedAppts[mockAddedAppts.length - 1]._id)
        ).toBeTruthy()
        expect(
            currentUser.appointments[0]._id
                .equals(mockAddedAppts[mockAddedAppts.length - 2]._id)
        ).toBeTruthy()
    })

    // ChatGPT Usage: No
    // Input: null
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
    // Input: appointmentId for an upcoming pending/accepted appointment
    // Expected status code: 200
    // Expected behavior: Clean up user's appointments. The appointment
    // status is set to CANCEL
    // Expected output: Message saying appointment is canceled successfully
    // but the other user is not found
    test("Should cancel an upcoming appointment successfully even if the other user is banned", async () => {
        // use the last appointment (pending appointment)
        mockAddedUsers[1].isBanned = true
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 1]._id.toString()
            });
        
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            message: "Canceled appointment successfully. However, the other user was not found or was banned"
        })
        var canceledAppt = mockAddedAppts[mockAddedAppts.length - 1]
        
        expect(canceledAppt.status).toBe(AppointmentStatus.CANCELED)
        // the endpoint should remove the past or canceled appointments
        var user = mockAddedUsers[0]
        expect(user.appointments.length).toBe(1)
        expect(
            user.appointments[0]._id
                .equals(mockAddedAppts[mockAddedAppts.length - 2]._id)
        ).toBeTruthy()
    })

    // ChatGPT Usage: No
    // Input: appointmentId for an upcoming pending/accepted appointment
    // Expected status code: 500
    // Expected behavior: Database unchanged
    // Expected output: Error message
    test("Should return 500 for a database error", async () => {
        const errorMessage = "Database error"
        User.findById.mockRejectedValueOnce(new Error(errorMessage))
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
        expect(mockAddedUsers[0].appointments.length).toBe(4)
    })

    // ChatGPT Usage: No
    // Input: appointmentId for an upcoming pending/accepted appointment
    // Expected status code: 404
    // Expected behavior: Clean up user's appointments. The appointment
    // status is unchanged
    // Expected output: inform message
    test("Should return 404 if unable to update the appointment status due to some database issue", async () => {
        mockUnableToUpdate = true
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 1]._id.toString()
            });

        expect(res.status).toBe(404)
        expect(res.body).toEqual({
            message: "Unable to cancel appointment. Appointment not found"
        })

        var canceledAppt = mockAddedAppts[mockAddedAppts.length - 1]
        expect(canceledAppt.status).not.toBe(AppointmentStatus.CANCELED)

    })
})

describe("Cancel an appointment for a manually-signed-up user",  () => {
    // ChatGPT Usage: No
    // Input: appointmentId for an upcoming pending/accepted appointment
    // Expected status code: 200
    // Expected behavior: Set the status of the appointment to CANCELED. 
    // Clean up user's appointments
    // Expected output: Success message
    test("Should cancel an upcoming pending/accepted appointment successfully", async () => {
        mockAddedUsers[0].useGoogleCalendar = false
        mockAddedUsers[1].useGoogleCalendar = false
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 1]._id.toString()
            });
        
        expect(res.status).toBe(200)
        var canceledAppt = mockAddedAppts[mockAddedAppts.length - 1]
        
        expect(canceledAppt.status).toBe(AppointmentStatus.CANCELED)
        // the endpoint should remove the past or canceled appointments
        for (var user of mockAddedUsers) {
            expect(user.appointments.length).toBe(1)
            expect(
                user.appointments[0]._id
                    .equals(mockAddedAppts[mockAddedAppts.length - 2]._id)
            ).toBeTruthy()
        }

        expect(google.auth.OAuth2).not.toHaveBeenCalled()
    })

})