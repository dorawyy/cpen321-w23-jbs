const request = require('supertest')
const mongoose = require("mongoose")
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils')
const { UserType } = require('../../../constants/user.types')
const { LocationMode } = require('../../../constants/location.modes')
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../../controllers/auth.controller')

const ENDPOINT = "/admin/ban"


var mockErrorMsg
var mockAddedUsers = []

// ChatGPT Usage: No
jest.mock('../../../db', () => {
    const originalDb = jest.requireActual('../../../db')
    class MockUser extends originalDb.user {
        static findById = jest.fn((id) => {
            if (mockErrorMsg) {
                console.log(mockErrorMsg)
                return Promise.reject(new Error(mockErrorMsg))
            }
            return Promise.resolve(mockAddedUsers.find(user => user._id == id))
        })
    }
    var mockDb = {
        user: MockUser
    }
    return mockDb
})

jest.mock("../../../middleware")

// Interface PUT https://edumatch.canadacentral.cloudapp.azure.com/admin/ban
describe("Banned user", () => {
    const mockAdminId = new mongoose.Types.ObjectId()
    const mockUserId = new mongoose.Types.ObjectId()

    let mockAdmin
    let mockUser

    beforeEach(() => {
        mockErrorMsg = undefined
        mockAddedUsers = []
        mockAdmin = {
            _id: mockAdminId,
            googleId: null,
            isBanned: false,
            googleOauth: null,
            type: UserType.ADMIN,
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
        mockUser = {
            _id: mockUserId,
            googleId: null,
            isBanned: false,
            googleOauth: null,
            type: UserType.TUTOR,
            username: "testuser2",
            password: "blablablaba2",
            email: "testemail2@test.com",
            displayedName: "Test user2",
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
                lat: 135,
                long: 479
            },
            recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS,
            bio: "test bio",
            useGoogleCalendar: false,
            userReviews: [],
            overallRating: 2,
            appointments: [{
                _id: "test appointment id",
                pstStartDateTime: "test date time",
                pstEndDateTime: "test end date time"
            }],
            hasSignedUp: true,
            save: async() => {
                return
            }
        }
    })

    authJwt.verifyJwt.mockImplementation((req, res, next) => {
        req.userId = mockAdminId
        return next()
    })

    // User is not banned
    account.verifyAccountStatus.mockImplementation((req, res, next) => {
        return next()
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) adminId is valid, exists, and is admin
    //  (2) userId is valid, exists, and is not admin
    // Expected status code: 200
    // Expected behavior: User is banned
    // Expected output: Success message
    test('Should pass when admin and user are valid', async() => {
        mockAddedUsers.push(mockAdmin)
        mockAddedUsers.push(mockUser)

        const mockRequestBody = {
            userId: mockUserId
        }

        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(200)
        expect(res.body).toEqual({ 
            message: "User with id " + mockUserId + " was banned successfully"
        })
        expect(mockAddedUsers[1].isBanned).toBeTruthy()
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) adminId is valid, exists, and is admin
    //  (2) userId is does not exist
    // Expected status code: 404
    // Expected behavior: Database is unchanged
    // Expected output: Error message
    test('Should fail if userId not found', async() => {
        mockAddedUsers.push(mockAdmin)
        mockAddedUsers.push(mockUser)

        const mockRequestBody = {
            userId: new mongoose.Types.ObjectId()
        }

        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(404)
        expect(res.body).toEqual({ 
            message: "User not found"
        })
        expect(mockAddedUsers[1].isBanned).toBeFalsy()
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) adminId is valid, exists, and is not admin
    // Expected status code: 404
    // Expected behavior: Database is unchanged
    // Expected output: Error message
    test('Should fail if not admin', async() => {
        mockAddedUsers.push({
            ...mockAdmin,
            type: UserType.TUTEE
        })
        mockAddedUsers.push(mockUser)

        const mockRequestBody = {
            userId: mockUserId
        }

        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(401)
        expect(res.body).toEqual({ 
            message: "User is not admin and is not authorized to ban"
        })
        expect(mockAddedUsers[1].isBanned).toBeFalsy()
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) adminId is valid, exists, and is admin
    //  (2) userId is valid, exists, and is admin
    // Expected status code: 404
    // Expected behavior: Database is unchanged
    // Expected output: Error message
    test('Should fail if user is admin', async() => {
        mockAddedUsers.push(mockAdmin)
        mockAddedUsers.push({
            ...mockUser,
            type: UserType.ADMIN
        })

        const mockRequestBody = {
            userId: mockUserId
        }

        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(401)
        expect(res.body).toEqual({ 
            message: "User is admin and can't be banned"
        })
        expect(mockAddedUsers[1].isBanned).toBeFalsy()
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) db throws an error upon query
    // Expected status code: 500
    // Expected behavior: Database is unchanged
    // Expected output: Error message
    test('Should fail when userId query throws error', async() => {
        mockAddedUsers.push(mockAdmin)
        mockAddedUsers.push(mockUser)

        const mockRequestBody = {
            userId: mockUserId
        }

        mockErrorMsg = "Error in finding user"

        const res = await request(app)
            .put(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(500)
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
        expect(mockAddedUsers[1].isBanned).toBeFalsy()
    })
})
