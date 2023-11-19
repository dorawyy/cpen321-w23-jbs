const request = require('supertest')
const mongoose = require("mongoose")
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils')
const { UserType } = require('../../../constants/user.types')
const { LocationMode } = require('../../../constants/location.modes')
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../../controllers/auth.controller')

const ENDPOINT = "/admin/users"


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
        static find = jest.fn(() => {
            return mockAddedUsers
        })
    }
    return {
        user: MockUser
    }
})

jest.mock("../../../middleware")

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/admin/users
describe("Get users", () => {
    const mockAdminId = new mongoose.Types.ObjectId()
    const mockUserId1 = new mongoose.Types.ObjectId()
    const mockUserId2 = new mongoose.Types.ObjectId()

    let mockAdmin
    let mockUser1
    let mockUser2

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
            displayedName: "A",
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
        mockUser1 = {
            _id: mockUserId1,
            googleId: null,
            isBanned: true,
            googleOauth: null,
            type: UserType.TUTOR,
            username: "testuser2",
            password: "blablablaba2",
            email: "testemail2@test.com",
            displayedName: "B",
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
        mockUser2 = {
            _id: mockUserId2,
            googleId: null,
            isBanned: true,
            googleOauth: null,
            type: UserType.TUTOR,
            username: "testuser2",
            password: "blablablaba2",
            email: "testemail2@test.com",
            displayedName: "C",
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
    // Expected status code: 200
    // Expected behavior: List of users is returned
    // Expected output: Success message
    test('Should pass when admin and user are valid', async() => {
        mockAddedUsers.push(mockAdmin)
        mockAddedUsers.push(mockUser1)
        mockAddedUsers.push(mockUser2)

        const res = await request(app)
            .get(ENDPOINT)

        expect(res.status).toBe(200)
        expect(res.body).toEqual({ 
            users: [
                {
                    userId: mockAdmin._id.toString(),
                    username: mockAdmin.username,
                    displayedName: mockAdmin.displayedName,
                    type: mockAdmin.type,
                    isBanned: mockAdmin.isBanned
                },
                {
                    userId: mockUser1._id.toString(),
                    username: mockUser1.username,
                    displayedName: mockUser1.displayedName,
                    type: mockUser1.type,
                    isBanned: mockUser1.isBanned
                },
                {
                    userId: mockUser2._id.toString(),
                    username: mockUser2.username,
                    displayedName: mockUser2.displayedName,
                    type: mockUser2.type,
                    isBanned: mockUser2.isBanned
                }
            ]
        })
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) adminId is valid, exists, and is not admin
    // Expected status code: 404
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail if not admin', async() => {
        mockAddedUsers.push({
            ...mockAdmin,
            type: UserType.TUTEE
        })
        mockAddedUsers.push(mockUser1)
        mockAddedUsers.push(mockUser2)

        const res = await request(app)
            .get(ENDPOINT)

        expect(res.status).toBe(401)
        expect(res.body).toEqual({ 
            message: "User is not admin and is not authorized to view user list"
        })
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) db throws an error upon query
    // Expected status code: 500
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when userId query throws error', async() => {
        mockAddedUsers.push(mockAdmin)
        mockAddedUsers.push(mockUser1)
        mockAddedUsers.push(mockUser2)

        mockErrorMsg = "Error in finding user"

        const res = await request(app)
            .get(ENDPOINT)

        expect(res.status).toBe(500)
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
    })
})
