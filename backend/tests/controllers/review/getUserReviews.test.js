const request = require('supertest');
const mongoose = require("mongoose")
const momenttz = require("moment-timezone")
const db = require("../../../db");
const { authJwt, account } = require("../../../middleware")

const { app } = require('../../utils/express.mock.utils');
const { PST_TIMEZONE, AppointmentStatus } = require('../../../constants/appointment.status');
const { mockGetOverallRating } = require('../../utils/rating.utils');

const ENDPOINT = "/review"

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

    return {
        user: MockUser,
        appointment: MockAppointment
    }
})

jest.mock("../../../middleware")

beforeEach(() => {
    mockUnableToCreateUser = false
    mockErrorMsg = undefined
    mockAddedModels = []
})


const User = db.user
const Appointment = db.appointment

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/review?userId=123
describe("Get user reviews", () => {
    // ChatGPT Usage: No
    // Input: userId for an existing, unbanned user
    // Expected status code: 200
    // Expected behavior: Retrieve all reviews of that user
    // Expected output: The specified user's reviews
    test("Should return all reviews for a valid, unbanned user", async () => {
        const mockUser = {
            _id: new mongoose.Types.ObjectId(),
            isBanned: false,
            userReviews: [
                { 
                    rating: 4, 
                    comment: 'Good tutor',
                    reviewerId: 'reviewer1' 
                },
                { 
                    rating: 5, 
                    comment: 'Excellent tutor',
                    reviewerId: 'reviewer2'
                }
            ]
        }

        User.findById.mockResolvedValueOnce(mockUser)
        
        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: mockUser._id.toString() })

        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            _id: mockUser._id.toString(),
            userReviews: mockUser.userReviews
        })
    })

    // ChatGPT Usage: No
    // Input: empty userId
    // Expected status code: 400
    // Expected behavior: Returns 400 with a message saying userId
    // must be specified
    // Expected output: error message
    test("Should return 400 for an empty userId", async () => {
        const res = await request(app)
            .get(ENDPOINT)
        
        expect(res.status).toBe(400)
        expect(res.body).toEqual({
            message: "Must specify userId"
        })    
    })

    // ChatGPT Usage: No
    // Input: userId for an existing, banned user
    // Expected status code: 404
    // Expected behavior: Returns 404 with a message saying user
    // not found
    // Expected output: error message
    test("Should return 404 for a banned user", async () => {
        const mockUser = {
            _id: new mongoose.Types.ObjectId(),
            isBanned: true
        }
        User.findById.mockResolvedValueOnce(mockUser)

        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: mockUser._id.toString() })

        expect(res.status).toBe(404)
        expect(res.body).toEqual({
            message: "User not found"
        })
    })

    // ChatGPT Usage: No
    // Input: userId for an existing user
    // Expected status code: 500
    // Expected behavior: Catch database error and return 500 status code
    // Expected output: error message
    test("Should return 500 for database error", async () => {
        const errorMessage = "Database error"
        User.findById.mockRejectedValueOnce(new Error(errorMessage))
        
        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: "test-user-id" })

        expect(res.status).toBe(500)
        expect(res.body).toEqual({
            message: errorMessage
        })
    })
})