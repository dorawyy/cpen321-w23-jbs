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

const ENDPOINT = "/appointment/cancel"

var mockErrorMsg
var mockAddedAppts = []
var mockAddedUsers = []
var mockUnableToCreateUser = false

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
jest.mock("../../../utils/google.utils", () => {
    return {
        cancelGoogleEvent: jest.fn()
    }
})

beforeEach(() => {
    mockUnableToCreateUser = false
    mockErrorMsg = undefined
    mockAddedAppts = []
    mockAddedUsers = []
})


const User = db.user
const Appointment = db.appointment

describe("Cancel appointment for a Google Calendar user", () => {
    const mockUserId = new mockMongoose.Types.ObjectId()
    // Assuming valid token
    authJwt.verifyJwt.mockImplementation((req, res, next) => {
        req.userId = mockUserId.toString()
        return next()
    })

    // User is not banned
    account.verifyAccountStatus.mockImplementation((req, res, next) => {
        return next()
    })

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

    test("Should cancel appointment successfully for an upcoming appointment", async () => {
        var mockUserAppts = []
        for (var i = 1; i <= 4; i++) {
            var start =  momenttz().tz(PST_TIMEZONE)
            var end

            if (i == 1) {
                start = start.subtract(i, 'days')
            } else {
                start = start.add(i, 'days')
            }
            
            end = start.add(2, 'hours')

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
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .query({ 
                appointmentId: mockAddedAppts[mockAddedAppts.length - 1]._id.toString()
            });
        
        console.log(res.body.message)
        expect(res.status).toBe(200)
        var canceledAppt = mockAddedAppts[mockAddedAppts.length - 1]
        
        expect(canceledAppt.status).toBe(AppointmentStatus.CANCELED)
        for (var user of mockAddedUsers) {
            expect(user.appointments.length).toBe(1)
            expect(
                user.appointments[0]._id
                    .equals(mockAddedAppts[mockAddedAppts.length - 2]._id)
            ).toBeTruthy()
        }

    })
})