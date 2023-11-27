const request = require('supertest')
const mongoose = require("mongoose")
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils')
const { UserType } = require('../../../constants/user.types')
const { LocationMode } = require('../../../constants/location.modes')
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../../controllers/auth.controller')

const ENDPOINT = "/admin/profile"


const mockAdminId = new mongoose.Types.ObjectId()
const mockUserId1 = new mongoose.Types.ObjectId()
const mockUserId2 = new mongoose.Types.ObjectId()

var mockErrorMsg
var mockAddedUsers = []
var mockConversation

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
        static find = jest.fn((query) => {
            return mockAddedUsers[1]
        })
        static aggregate = jest.fn(() => ({
            unwind: jest.fn(() => ({
                match: jest.fn(() => ({
                    project: jest.fn(() => {
                        return [
                            { comment: 'dummy comment 1' },
                            { comment: 'dummy comment 2' }
                        ]
                    })
                }))
            }))
        }))
    }
    class MockConversation extends originalDb.conversation {
        static find = jest.fn(() => {
            return [
                mockConversation
            ]
        })
    }
    var mockDb = {
        user: MockUser,
        conversation: MockConversation
    }
    return mockDb
})

jest.mock("../../../middleware")

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/admin/profile
describe("Get user profile", () => {
    let mockAdmin
    let mockUser1

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
        mockConversation = { 
            participants: {
                userId1: mockUserId1.toString(),
                userId2: mockUserId2.toString(),
                displayedName1: "B",
                displayedName2: "C"
            },
            messages: [
                {
                    senderId: mockUserId1.toString(),
                    content: "dummy content 1",
                    timestamp: "dummy timestamp 1"
                },
                {
                    senderId: mockUserId2.toString(),
                    content: "dummy content 2",
                    timestamp: "dummy timestamp 2"
                },
                {
                    senderId: mockUserId1.toString(),
                    content: "dummy content 3",
                    timestamp: "dummy timestamp 3"
                }
            ]
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
    //  (2) userId is valid and exists
    // Expected status code: 200
    // Expected behavior: User bio, reviews given, and messages are returned
    // Expected output: Success message
    test('Should pass when admin and user are valid', async() => {
        mockAddedUsers.push(mockAdmin)
        mockAddedUsers.push(mockUser1)

        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: mockUserId1.toString() })

        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            bio: "test bio",
            reviews: [
                { comment: 'dummy comment 1' },
                { comment: 'dummy comment 2' }
            ],
            messages: [
                {
                    senderId: mockUserId1.toString(),
                    content: "dummy content 1",
                    timestamp: "dummy timestamp 1"
                },
                {
                    senderId: mockUserId1.toString(),
                    content: "dummy content 3",
                    timestamp: "dummy timestamp 3"
                }
            ]
        })
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
        mockAddedUsers.push(mockUser1)

        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: new mongoose.Types.ObjectId() })

        expect(res.status).toBe(404)
        expect(res.body).toEqual({ 
            message: "Could not find user in database with provided id"
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

        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: mockUserId1.toString() })

        expect(res.status).toBe(401)
        expect(res.body).toEqual({ 
            message: "User is not admin and is not authorized to view user profile and messages"
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

        mockErrorMsg = "Error in finding user"

        const res = await request(app)
            .get(ENDPOINT)
            .query({ userId: mockUserId1.toString() })

        expect(res.status).toBe(500)
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
    })
})
