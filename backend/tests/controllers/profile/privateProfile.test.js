const request = require('supertest');
const mongoose = require("mongoose")
const db = require("../../../db");
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils');
const { UserType } = require('../../../constants/user.types');
const { LocationMode } = require('../../../constants/location.modes');
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../../controllers/auth.controller');
const { EXCLUDED_FIELDS } = require('../../../controllers/profile.controller');
const { filterOutExcludedFields } = require('../../utils/profile.utils');

const ENDPOINT = "/user/profile"

const MOCK_EXCLUDED_FIELDS = [
    "-_id",
    "-googleId",
    "-password",
    "-googleOauth",
    "-recommendationWeights",
    "-hasSignedUp"
]


var mockErrorMsg
var mockAddedUsers = []
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
            mockAddedUsers[0] = {
                ...mockAddedUsers[0],
                ...data
            }
            return Promise.resolve(mockAddedUsers[0])
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
    return {
        user: MockUser,
    }
})

jest.mock("../../../middleware")


beforeEach(() => {
    mockUnableToCreateUser = false
    mockErrorMsg = undefined
    mockAddedUsers = []
})

const User = db.user

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/user/profile
describe("Get user's private profile", () => {
    const mockUserId = new mongoose.Types.ObjectId()
    // Assuming valid token
    authJwt.verifyJwt.mockImplementation((req, res, next) => {
        req.userId = mockUserId
        return next()
    })

    // User is not banned
    account.verifyAccountStatus.mockImplementation((req, res, next) => {
        return next()
    })

    // ChatGPT Usage: No
    // Input: userId for an existing and unbanned user
    // Expected status code: 200
    // Expected behavior: Filter out fields that shouldn't be visible to user.
    // Returns the necessary user's private info
    // Expected output: User's private profile
    test("Should return user's private profile data for a valid, unbanned user", async () => {
        const mockUser = {
            _id: mockUserId,
            googleId: null,
            isBanned: false,
            googleOauth: null,
            type: UserType.TUTEE,
            username: "testuser",
            password: "blablablaba",
            email: "testemail@test.com",
            displayedName: "Test user",
            phoneNumber: "123-456-789",
            education: {
                school: "test school",
                program: "test program",
                level: 1,
                courses: ["Course 1"],
            },
            manualAvailability: [
                {
                    day: "Sunday",
                    startTime: "09:00",
                    endTime: "17:00"
                }
            ],
            locationMode: LocationMode.IN_PERSON,
            location: {
                lat: 123,
                long: 456
            },
            recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS,
            bio: "test bio",
            useGoogleCalendar: false,
            userReviews: [],
            overallRating: 0,
            appointments: [{
                _id: "test appointment id",
                pstStartDateTime: "test date time",
                pstEndDateTime: "test end date time"
            }],
            hasSignedUp: true
        }

        var expectedData = filterOutExcludedFields(mockUser)

        User.findById.mockImplementationOnce((userId) => {
            return {
                select: jest.fn((excludedList) => Promise.resolve(
                    filterOutExcludedFields(mockUser, excludedList)
                ))
            }
        })

        const res = await request(app)
            .get(ENDPOINT)
            .set('Authorization', 'Bearer mockValidToken')

        expect(res.status).toBe(200)
        expect(res.body).toEqual(expectedData)
    })

    // ChatGPT Usage: No
    // Input: userId for an existing and unbanned user
    // Expected status code: 500
    // Expected behavior: Runs into database error and returns 500 status code
    // Expected output: error message
    test("Should return 500 for database error", async () => {
        const errorMessage = "Database error"
        User.findById.mockImplementationOnce((userId) => {
            return {
                select: jest.fn(() => Promise.reject(new Error(errorMessage)))
            }
        })        
        const res = await request(app)
            .get(ENDPOINT)
            .set('Authorization', 'Bearer mockValidToken')

        expect(res.status).toBe(500)
        expect(res.body).toEqual({ message: errorMessage })
    })
})