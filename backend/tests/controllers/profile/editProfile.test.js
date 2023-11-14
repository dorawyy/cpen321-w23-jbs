const request = require('supertest');
const mongoose = require("mongoose")
const db = require("../../../db");
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils');
const { UserType } = require('../../../constants/user.types');
const { LocationMode } = require('../../../constants/location.modes');
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../../controllers/auth.controller');
const { filterOutExcludedFields } = require('../../utils/profile.utils');

const ENDPOINT = "/user/editProfile"


var mockErrorMsg
var mockAddedUsers = []
var mockUnableToCreateUser = false
var mockFilterOutExcludedFields = filterOutExcludedFields

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
            return {
                select: jest.fn((excludedList) => Promise.resolve(
                    mockFilterOutExcludedFields(mockAddedUsers[0], excludedList)
                ))
            }
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

// Interface PUT https://edumatch.canadacentral.cloudapp.azure.com/user/editProfile
describe("Edit profile", () => {
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

    var mockUser = {
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

    // ChatGPT Usage: Partial
    // Input: 
    //  (1) userId for an existing and unbanned user, 
    //  (2) data that is allowed to be updated
    // Expected status code: 200
    // Expected behavior: update the allowed fields for the user entry in db
    // Expected output: User's updated data
    test("Should edit the profiel successfully if the updated fields are allowed", async () => {
        mockAddedUsers.push(mockUser)

        const mockRequestBody = {
            displayedName: "Test User Updated",
            phoneNumber: "987-654-321",
            bio: "test bio updated"
        }

        var mockUserUpdated = {
            ...mockUser,
            ...mockRequestBody
        }

        var expectedData = filterOutExcludedFields(mockUserUpdated)

        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(200)
        expect(res.body).toEqual(expectedData)
        expect(mockAddedUsers[0]).toEqual(mockUserUpdated)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) userId for an existing and unbanned user
    //  (2) data containing fields that aren't allowed to be updated
    // Expected status code: 200
    // Expected behavior: ONLY update the allowed fields for the user
    // entry in db while ignoring the disallowed fields
    // Expected output: User's updated data. The disallowed fields are unchanged
    test("Shoud ignore the fields that aren't allowed to be updated by users", async () => {
        mockAddedUsers.push(mockUser)

        const mockRequestBody = {
            displayedName: "Test User Updated",
            overallRating: 5
        }

        var mockUserUpdated = {
            ...mockUser,
            displayedName: mockRequestBody.displayedName
        }

        var expectedData = filterOutExcludedFields(mockUserUpdated)

        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(200)
        expect(res.body).toEqual(expectedData)
        expect(mockAddedUsers[0]).toEqual(mockUserUpdated)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) userId for an existing and unbanned user
    //  (2) data to be updated
    // Expected status code: 500
    // Expected behavior: Database unchanged
    // Expected output: error message
    test("Should return 500 for database error", async () => {
        mockAddedUsers.push(mockUser)

        const mockRequestBody = {
            displayedName: "Test User Updated",
        }
    
        const errorMessage = "Database error"
        User.findByIdAndUpdate.mockImplementationOnce((userId) => {
            return {
                select: jest.fn(() => Promise.reject(new Error(errorMessage)))
            }
        })   
        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(500)
        expect(res.body).toEqual({ message: errorMessage })
        expect(mockAddedUsers[0]).toEqual(mockUser)
    })
})