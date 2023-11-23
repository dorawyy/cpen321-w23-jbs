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

const ENDPOINT = "/appointment"

var mockErrorMsg
var mockAddedAppts = []
var mockAddedUsers = []
var mockUnableToCreateUser = false
var mockUnableToUpdate = false

// ChatGPT Usage: Partial
jest.mock('../../../db', () => {
    const originalDb = jest.requireActual('../../../db')
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
    }

    return {
        appointment: MockAppointment
    }
})

jest.mock("../../../middleware")

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
        displayedName: "Tutor X"
    }

    var otherUser = {
        _id: new mockMongoose.Types.ObjectId(),
        isBanned: false,
        type: UserType.TUTEE,
        useGoogleCalendar: true,
        displayedName: "Tutee X"
    } 

    var start =  momenttz().tz(PST_TIMEZONE)
    var end = start.clone().add(2, 'hours')
    var appt = {
        _id: new mockMongoose.Types.ObjectId(),
        pstStartDatetime: start.toISOString(true),
        pstEndDatetime: end.toISOString(true),   
        participantsInfo: [
            {
                userId: mockUser._id.toString(),
                displayedName: mockUser.displayedName 
            },
            { 
                userId: otherUser._id.toString(),
                displayedName: otherUser.displayedName 
            },
        ],
        course: `test course`,
        location: `test location`,
        status: AppointmentStatus.PENDING,
        notes: "blablabla"
    }
    
    mockAddedAppts.push(new Appointment(appt))
    mockAddedUsers.push(mockUser, otherUser)
})

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/appointment
describe("Get a specific appointment", () => {
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
    // Input: valid userId, appointmentId that belongs to the user
    // Expected status code: 200
    // Expected behavior: Return appointment info of the queried appointmentId
    // Expected output: appointment data
    test("Should retrieve an appointment successfully if the appointment belongs to the user", async () => {
        const res = await request(app)
            .get(ENDPOINT)
            .query({ appointmentId: mockAddedAppts[0]._id.toString() })
        var expected = {
            ...mockAddedAppts[0].toObject(),
            _id: mockAddedAppts[0]._id.toString(),
            otherUserName: mockAddedUsers[1].displayedName
        }
        for (var i = 0; i < 2; i++) {
            expected.participantsInfo[i]._id = expected.participantsInfo[i]._id.toString()
        }
        expect(res.status).toBe(200)
        expect(res.body).toEqual(expected)
    })

    // ChatGPT Usage: No
    // Input: valid userId, appointmentId that doesn't belong to the user
    // Expected status code: 403
    // Expected behavior: forbids user to view the appointment
    // Expected output: inform message
    test("Should return 403 if the appointmentId doesn't belong to the user", async () => {
        mockAddedAppts[0].participantsInfo[0].userId = new mockMongoose.Types.ObjectId().toString()
        const res = await request(app)
            .get(ENDPOINT)
            .query({ appointmentId: mockAddedAppts[0]._id.toString() })
        
        expect(res.status).toBe(403)
        expect(res.body).toHaveProperty("message")
    })

    // ChatGPT Usage: No
    // Input: valid userId, appointmentId 
    // Expected status code: 500
    // Expected behavior: Catch the error
    // Expected output: error message
    test("Should return 500 for a database error", async () => {
        const errorMessage = "Database error"
        Appointment.findById.mockRejectedValueOnce(new Error(errorMessage))

        const res = await request(app)
            .get(ENDPOINT)
            .query({ appointmentId: mockAddedAppts[0]._id.toString() })
        
        expect(res.status).toBe(500)
        expect(res.body).toEqual({ message: errorMessage })
    })

    // ChatGPT Usage: No
    // Input: valid userId, appointmentId that doesn't exist
    // Expected status code: 404
    // Expected behavior: Can't find appointment
    // Expected output: inform message
    test("Should return 404 if appointment doesn't exist", async () => {
        Appointment.findById.mockResolvedValueOnce(undefined)
        const res = await request(app)
            .get(ENDPOINT)
            .query({ appointmentId: mockAddedAppts[0]._id.toString() })
        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty("message")
    })

    // ChatGPT Usage: No
    // Input: valid userId, null appointmentId
    // Expected status code: 400
    // Expected behavior: detect empty query
    // Expected output: inform message
    test("Should return 400 if appointmentId is empty", async () => {
        const res = await request(app).get(ENDPOINT)
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty("message")
    })
})

