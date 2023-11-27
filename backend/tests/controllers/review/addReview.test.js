const request = require('supertest');
const mongoose = require("mongoose")
const momenttz = require("moment-timezone")
const db = require("../../../db");
const { authJwt, account } = require("../../../middleware")

const { app } = require('../../utils/express.mock.utils');
const { PST_TIMEZONE, AppointmentStatus } = require('../../../constants/appointment.status');
const { mockGetOverallRating } = require('../../utils/rating.utils');

const ENDPOINT = "/review/addReview"

var mockErrorMsg
var mockAddedModels = []
var mockUnableToCreateUser = false

// ChatGPT Usage: Partial
jest.mock('../../../db', () => {
    const originalDb = jest.requireActual('../../../db')
    class MockUser extends originalDb.user {
        static findById = jest.fn()
        static findOne = jest.fn()

        static findByIdAndUpdate = jest.fn((id, data) => {
            if (mockErrorMsg) {
                return Promise.reject(new Error(mockErrorMsg))
            }
            mockAddedModels[0] = {
                ...mockAddedModels[0],
                ...data
            }
            return Promise.resolve(mockAddedModels[0])
        })

        save = jest.fn(() => {
            if (mockErrorMsg) {
                return Promise.reject(new Error(mockErrorMsg))
            }
            if (mockUnableToCreateUser) {
                return Promise.resolve(undefined)
            }
            mockAddedModels.push(this)
            return Promise.resolve(this)
        })

    }
    class MockAppointment extends originalDb.appointment {
        static findById = jest.fn()
        static findOne = jest.fn()

        static findByIdAndUpdate = jest.fn((id, data) => {
            if (mockErrorMsg) {
                return Promise.reject(new Error(mockErrorMsg))
            }
            mockAddedModels[0] = {
                ...mockAddedModels[0],
                ...data
            }
            return Promise.resolve(mockAddedModels[0])
        })

        save = jest.fn(() => {
            if (mockErrorMsg) {
                return Promise.reject(new Error(mockErrorMsg))
            }
            if (mockUnableToCreateUser) {
                return Promise.resolve(undefined)
            }
            mockAddedModels.push(this)
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

beforeEach(() => {
    mockUnableToCreateUser = false
    mockErrorMsg = undefined
    mockAddedModels = []
})


const User = db.user
const Appointment = db.appointment

// Interface POST https://edumatch.canadacentral.cloudapp.azure.com/review/addReview
describe("Add review", () => {
    const mockUserId = new mongoose.Types.ObjectId()
    // Assuming valid token
    authJwt.verifyJwt.mockImplementation((req, res, next) => {
        req.userId = mockUserId.toString()
        return next()
    })

    // User is not banned
    account.verifyAccountStatus.mockImplementation((req, res, next) => {
        return next()
    })

    var mockReviewer = {
        _id: mockUserId,
        displayedName: "Mock Reviewer",
        isBanned: false
    }
    
    var mockReceiver = new User({
        _id: new mongoose.Types.ObjectId(),
        displayedName: "Mock Receiver",
        userReviews: [],
        overallRating: 0
    })

    // ChatGPT Usage: Partial
    // Input: 
    //  (1) Valid and existing userId
    //  (2) Review data for an accepted, completed appointment
    // Expected status code: 200
    // Expected behavior: Add the review to the receiver's profile if the appointment
    // was accepted and completed
    // Expected output: The receiver's updated reviews and overall rating
    test("Should add a review successfully when the appointment is accepted and completed", async () => {
        User.findById
            .mockResolvedValueOnce(mockReviewer)
            .mockResolvedValueOnce(mockReceiver)
        
        var start = momenttz()
            .tz(PST_TIMEZONE)
            .subtract(5, 'days')
    
        var end = start.add(2, 'hours')

        var mockAppointment = new Appointment ({
            _id: new mongoose.Types.ObjectId(),
            participantsInfo: [
                { userId: mockReceiver._id.toString() },
                { userId: mockUserId.toString() },
            ], 
            course: "test course",
            pstStartDatetime: start.toISOString(true),
            pstEndDatetime: end.toISOString(true),
            location: "test location",
            status: AppointmentStatus.ACCEPTED,
            notes: "blablabla"
        })

        Appointment.findById
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)

        const review = {
            rating: 4,
            noShow: false,
            late: false,
            comment: "blablabla",
            appointmentId: mockAppointment._id.toString()
        }
        
        const mockReviewBody = {
            receiverId: mockReceiver._id.toString(),
            ...review
        }
        
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockReviewBody)
        
        expect(res.status).toBe(200)

        expect(mockAddedModels.length).toBe(2)

        var updatedReceiver = mockAddedModels[0]

        var expectedUserReviews = [{
            _id: updatedReceiver.userReviews[0]._id,
            reviewerId: mockUserId.toString(),
            reviewerDisplayedName: mockReviewer.displayedName,
            ...review
        }]

        var expectedUpdatedReceiver = {
            ...mockReceiver.toObject(),
            userReviews: expectedUserReviews,
            overallRating: mockGetOverallRating(expectedUserReviews)
        }

        expect(updatedReceiver.toObject()).toEqual(expectedUpdatedReceiver)
        
        var updatedAppointment = mockAddedModels[1]

        var expectedUpdatedAppt = {
            ...mockAppointment.toObject(),
            participantsInfo: [
                {
                    userId: mockReceiver._id.toString(),
                    noShow: mockReviewBody.noShow,
                    late: mockReviewBody.late,
                    _id: updatedAppointment.participantsInfo[0]._id
                },
                { 
                    _id: updatedAppointment.participantsInfo[1]._id,
                    userId: mockUserId.toString() 
                }
            ]
        }

        expect(updatedAppointment.toObject()).toEqual(expectedUpdatedAppt)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) Valid and existing userId
    //  (2) Review data for an unaccepted appointment
    // Expected status code: 403
    // Expected behavior: Forbid the user to add review. Database unchanged
    // Expected output: error message
    test("Shouldn't proceed and return 403 if the appointment wasn't accepted", async () => {
        var start = momenttz()
            .tz(PST_TIMEZONE)
            .subtract(5, 'days')

        var end = start.add(2, 'hours')

        var mockAppointment = new Appointment ({
            _id: new mongoose.Types.ObjectId(),
            participantsInfo: [
                { userId: mockReceiver._id.toString() },
                { userId: mockUserId.toString() },
            ], 
            course: "test course",
            pstStartDatetime: start.toISOString(true),
            pstEndDatetime: end.toISOString(true),
            location: "test location",
            status: AppointmentStatus.PENDING,
            notes: "blablabla"
        })

        Appointment.findById
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)

        const review = {
            rating: 4,
            noShow: false,
            late: false,
            comment: "blablabla",
            appointmentId: mockAppointment._id.toString()
        }
        
        const mockReviewBody = {
            receiverId: mockReceiver._id.toString(),
            ...review
        }
        
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockReviewBody)
        
        expect(res.status).toBe(403)
        expect(res.body).toEqual({
            message: "The appointment hasn't been accepted" 
        })
        expect(mockAddedModels.length).toBe(0)
    })
    
    // ChatGPT Usage: No
    // Input: 
    //  (1) Valid and existing userId
    //  (2) Review data for a future appointment
    // Expected status code: 403
    // Expected behavior: Forbid the user to add review. Database unchanged
    // Expected output: error message
    test("Shouldn't proceed and return 403 if the appointment hasn't completed", async () => {
        var start = momenttz()
            .tz(PST_TIMEZONE)
            .add(5, 'days')

        var end = start.add(2, 'hours')

        var mockAppointment = new Appointment ({
            _id: new mongoose.Types.ObjectId(),
            participantsInfo: [
                { userId: mockReceiver._id.toString() },
                { userId: mockUserId.toString() },
            ], 
            course: "test course",
            pstStartDatetime: start.toISOString(true),
            pstEndDatetime: end.toISOString(true),
            location: "test location",
            status: AppointmentStatus.ACCEPTED,
            notes: "blablabla"
        })

        Appointment.findById
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)

        const review = {
            rating: 4,
            noShow: false,
            late: false,
            comment: "blablabla",
            appointmentId: mockAppointment._id.toString()
        }
        
        const mockReviewBody = {
            receiverId: mockReceiver._id.toString(),
            ...review
        }
        
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockReviewBody)
        
        expect(res.status).toBe(403)
        expect(res.body).toEqual({
            message: "The appointment hasn't completed" 
        })
        expect(mockAddedModels.length).toBe(0)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) Valid and existing userId
    //  (2) Review data for an undefined appointment
    // Expected status code: 400
    // Expected behavior: Forbid the user to add review. Database unchanged
    // Expected output: error message
    test("Should return 400 for an empty appointmentId", async () => {
        const review = {
            rating: 4,
            noShow: false,
            late: false,
            comment: "blablabla",
        }
        const mockReviewBody = {
            receiverId: mockReceiver._id.toString(),
            ...review
        }
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockReviewBody)

        expect(res.status).toBe(400)
        expect(res.body).toEqual({
            message: "appointmentId is required"
        })
        expect(mockAddedModels.length).toBe(0)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) Valid and existing userId
    //  (2) Review data 
    // Expected status code: 500
    // Expected behavior: Catch the error and returns 500 status code
    // Expected output: error message
    test("Should return 500 for a database lookup error", async () => {
        const errorMessage = "Database error"
        Appointment.findById
            .mockRejectedValueOnce(new Error(errorMessage))

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send({ appointmentId: "test-appt-id" })

        expect(res.status).toBe(500)
        expect(res.body).toEqual({ message: errorMessage })
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) Valid and existing userId
    //  (2) Review data
    // Expected status code: 500
    // Expected behavior: Catch the error and returns 500 status code. Database unchanged
    // Expected output: error message
    test("Should return 500 for a database save error", async () => {
        User.findById
            .mockResolvedValueOnce(mockReviewer)
            .mockResolvedValueOnce(mockReceiver)
        
        var start = momenttz()
            .tz(PST_TIMEZONE)
            .subtract(5, 'days')
    
        var end = start.add(2, 'hours')

        var mockAppointment = new Appointment ({
            _id: new mongoose.Types.ObjectId(),
            participantsInfo: [
                { userId: mockReceiver._id.toString() },
                { userId: mockUserId.toString() },
            ], 
            course: "test course",
            pstStartDatetime: start.toISOString(true),
            pstEndDatetime: end.toISOString(true),
            location: "test location",
            status: AppointmentStatus.ACCEPTED,
            notes: "blablabla"
        })

        Appointment.findById
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)

        const review = {
            rating: 4,
            noShow: false,
            late: false,
            comment: "blablabla",
            appointmentId: mockAppointment._id.toString()
        }
        
        const mockReviewBody = {
            receiverId: mockReceiver._id.toString(),
            ...review
        }

        mockErrorMsg = "Save error"
        
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockReviewBody)

        expect(res.status).toBe(500)
        expect(res.body).toEqual({ message: mockErrorMsg })
        expect(mockAddedModels.length).toBe(0)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) Valid and existing userId
    //  (2) Review data for an existing, banned receiver
    // Expected status code: 404
    // Expected behavior: Database unchanged
    // Expected output: message saying user not found
    test("Should return 404 when the receiver is banned", async () => {
        var bannedReceiver = {
            _id: new mongoose.Types.ObjectId(),
            displayedName: "Mock Receiver",
            userReviews: [],
            overallRating: 0,
            isBanned: true
        }

        User.findById
            .mockResolvedValueOnce(mockReviewer)
            .mockResolvedValueOnce(bannedReceiver)
        
        var start = momenttz()
            .tz(PST_TIMEZONE)
            .subtract(5, 'days')
    
        var end = start.add(2, 'hours')
        var mockAppointment = new Appointment ({
            _id: new mongoose.Types.ObjectId(),
            participantsInfo: [
                { userId: bannedReceiver._id.toString() },
                { userId: mockUserId.toString() },
            ], 
            course: "test course",
            pstStartDatetime: start.toISOString(true),
            pstEndDatetime: end.toISOString(true),
            location: "test location",
            status: AppointmentStatus.ACCEPTED,
            notes: "blablabla"
        })

        Appointment.findById
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)

        const review = {
            rating: 4,
            noShow: false,
            late: false,
            comment: "blablabla",
            appointmentId: mockAppointment._id.toString()
        }
        
        const mockReviewBody = {
            receiverId: bannedReceiver._id.toString(),
            ...review
        }

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockReviewBody)

        expect(res.status).toBe(404)
        expect(res.body).toEqual({ message: "user not found" })
        expect(mockAddedModels.length).toBe(0)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) Valid and existing userId
    //  (2) Review data for an existing, unbanned receiver
    // Expected status code: 404
    // Expected behavior: Database unchanged
    // Expected output: message saying user not found
    test("Should return 404 when receiver is not found during saving data", async () => {
        User.findById
            .mockResolvedValueOnce(mockReviewer)
            .mockResolvedValueOnce(mockReceiver)
        
        var start = momenttz()
            .tz(PST_TIMEZONE)
            .subtract(5, 'days')
    
        var end = start.add(2, 'hours')

        var mockAppointment = new Appointment ({
            _id: new mongoose.Types.ObjectId(),
            participantsInfo: [
                { userId: mockReceiver._id.toString() },
                { userId: mockUserId.toString() },
            ], 
            course: "test course",
            pstStartDatetime: start.toISOString(true),
            pstEndDatetime: end.toISOString(true),
            location: "test location",
            status: AppointmentStatus.ACCEPTED,
            notes: "blablabla"
        })

        Appointment.findById
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)
            .mockResolvedValueOnce(mockAppointment)

        const review = {
            rating: 4,
            noShow: false,
            late: false,
            comment: "blablabla",
            appointmentId: mockAppointment._id.toString()
        }
        
        const mockReviewBody = {
            receiverId: mockReceiver._id.toString(),
            ...review
        }

        mockUnableToCreateUser = true
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockReviewBody)
        
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ message: "user not found"})
    })
})

