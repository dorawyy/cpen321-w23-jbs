const request = require('supertest');
const mockMongoose = require("mongoose")
const momenttz = require("moment-timezone")
const db = require("../../../db");
const { authJwt, account } = require("../../../middleware")

const { app } = require('../../utils/express.mock.utils');
const { PST_TIMEZONE, AppointmentStatus } = require('../../../constants/appointment.status');
const { UserType } = require('../../../constants/user.types');

const ENDPOINT = "/appointments"

var mockErrorMsg
var mockAddedAppts = []
var mockAddedUsers = []
var mockMoment = momenttz
const MOCK_PST_TIMEZONE = PST_TIMEZONE

// ChatGPT Usage: Partial
jest.mock('../../../db', () => {
    const originalDb = jest.requireActual('../../../db')
    class MockAppointment extends originalDb.appointment {
        static find = jest.fn((query) => {
            var timeMin = mockMoment(query.$or[0].pstEndDatetime.$gte)
                .tz(MOCK_PST_TIMEZONE)
            var timeMax = mockMoment(query.$or[0].pstEndDatetime.$lte)
                .tz(MOCK_PST_TIMEZONE)
            var courses
            if (query.course) {
                courses = query.course.$in
            }
            var userId = query["participantsInfo.userId"]

            var appts = mockAddedAppts.filter(appt => {
                var isOfUser = appt.participantsInfo[0].userId === userId
                var endTimeIsWithin = mockMoment(appt.pstEndDatetime)
                    .tz(MOCK_PST_TIMEZONE)
                    .isBetween(timeMin, timeMax)
                var startTimeIsWithin = mockMoment(appt.pstStartDatetime)
                    .tz(MOCK_PST_TIMEZONE)
                    .isBetween(timeMin, timeMax)
                if (isOfUser && (endTimeIsWithin || startTimeIsWithin)) {
                    if (courses) {
                        return courses.includes(appt.course)
                    }
                    return true
                }
                return false
            })
            return {
                sort: jest.fn(() => {
                    if (mockErrorMsg) {
                        return Promise.reject(new Error(mockErrorMsg))
                    }
                    return Promise.resolve(appts)
                })
            }

        })

    }

    var mockDb = {
        appointment: MockAppointment
    }
    return mockDb
})

jest.mock("../../../middleware")

const mockUserId = new mockMongoose.Types.ObjectId()

beforeEach(() => {
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

    // i = 1: appointment 16 days ago
    // i = 2: accepted appointment in the past 15 days
    // i = 3 -> 5: pending appointments in the past 15 days
    // i = 6 -> 9: pending appointments in the next 15 days
    // i = 10: appointment in 16 days
    for (var i = 1; i <= 10; i++) {
        var start =  momenttz()
            .tz(PST_TIMEZONE)
            .subtract(15, "days")
            .add(i, "days")
        var end
        if (i == 1) {
            start = momenttz()
                .tz(PST_TIMEZONE)
                .subtract(16, "days")
        } else if (i == 10) {
            start = momenttz()
                .tz(PST_TIMEZONE)
                .add(16, "days")
        } else if (i > 5) {
            start = momenttz()
                .tz(PST_TIMEZONE)
                .add(i, "days")
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
            status: i == 2 ? AppointmentStatus.ACCEPTED : AppointmentStatus.PENDING,
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

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/appointments
describe("Get user appointments", () => {
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
    // Input: valid userId
    // Expected status code: 200
    // Expected behavior: Get appointments within +-15 days for all courses,
    // filtering out past pending appointments
    // Expected output: appointments within +-15 days without past pending appointments
    test("Should return appointments within +-15 days for all courses, filtering out past pending appointments", async () => {
        const res = await request(app).get(ENDPOINT)
        var expectedAppts = [mockAddedAppts[1], ...mockAddedAppts.slice(5, 9)]
        expectedAppts = expectedAppts.map(appt => {
            appt._id = appt._id.toString()
            return appt
        })

        expect(res.status).toBe(200)
        expect(res.body.appointments.length).toBe(expectedAppts.length)
        expect(res.body.appointments).toEqual(expectedAppts)
    })

    // ChatGPT Usage: No
    // Input: valid userId, course
    // Expected status code: 200
    // Expected behavior: Get appointments within +-15 days for the queried course,
    // filtering out past pending appointments
    // Expected output: appointments within +-15 days without past pending appointments
    // for the queried course
    test("Should return appointments within +-15 days for a specific course", async () => {
        mockAddedAppts[2].status = AppointmentStatus.ACCEPTED
        const res = await request(app)
            .get(ENDPOINT)
            .query({ courses: "test course 2,test course 3" })
        
        var expectedAppts = mockAddedAppts.slice(1, 3)
        expectedAppts = expectedAppts.map(appt => {
            appt._id = appt._id.toString()
            return appt
        })
        expect(res.status).toBe(200)
        expect(res.body.appointments.length).toBe(expectedAppts.length)
        expect(res.body.appointments).toEqual(expectedAppts)
    })

    // ChatGPT Usage: No
    // Input: valid userId
    // Expected status code: 500
    // Expected behavior: Catch the error
    // Expected output: Error message
    test("Should return 500 for a database error", async () => {
        mockErrorMsg = "Database error"
        
        const res = await request(app).get(ENDPOINT)
        
        expect(res.status).toBe(500)
        expect(res.body).toEqual({ message: mockErrorMsg })
    })
            
})