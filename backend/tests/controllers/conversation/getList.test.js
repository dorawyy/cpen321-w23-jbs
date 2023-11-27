const request = require('supertest')
const mongoose = require("mongoose")
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils')
const { UserType } = require('../../../constants/user.types')
const { LocationMode } = require('../../../constants/location.modes')
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../../controllers/auth.controller')

const ENDPOINT = "/conversation/get_list"


const mockUserId1 = new mongoose.Types.ObjectId()
const mockUserId2 = new mongoose.Types.ObjectId()
const mockConversationId1 = new mongoose.Types.ObjectId()
const mockConversationId2 = new mongoose.Types.ObjectId()

var mockErrorMsg
var mockAddedUsers = []
var mockConversations = []

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
    class MockConversation extends originalDb.conversation {
        static find = jest.fn(() => {
            return mockConversations
        })
    }
    var mockDb = {
        user: MockUser,
        conversation: MockConversation
    }
    return mockDb
})

jest.mock("../../../middleware")

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/conversation/get_list
describe("Get list of conversations", () => { 
    let mockUser1 = {
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
    let mockConversation1 = {
        _id: mockConversationId1,
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
    let mockConversation2 = {
        _id: mockConversationId2,
        participants: {
            userId1: mockUserId1.toString(),
            userId2: mockUserId2.toString(),
            displayedName1: "C",
            displayedName2: "B"
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

    beforeEach(() => {
        mockErrorMsg = undefined
        mockAddedUsers = []
        mockConversations = []        
    })

    authJwt.verifyJwt.mockImplementation((req, res, next) => {
        req.userId = mockUserId1
        return next()
    })

    // User is not banned
    account.verifyAccountStatus.mockImplementation((req, res, next) => {
        return next()
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) userId is valid and exists
    // Expected status code: 200
    // Expected behavior: List of conversations of user is returned
    // Expected output: List of conversations, where conversationName is displayedName of other user
    test('Should pass when userId is valid', async() => {
        mockAddedUsers.push(mockUser1)
        mockConversations.push(mockConversation1)
        mockConversations.push(mockConversation2)

        const res = await request(app)
            .get(ENDPOINT)

        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            conversations: [
                {
                    conversationId: mockConversationId1.toString(),
                    conversationName: "C"
                },
                {
                    conversationId: mockConversationId2.toString(),
                    conversationName: "C"
                }
            ]
        })
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) db throws an error upon query
    // Expected status code: 500
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when userId query throws error', async() => {
        mockAddedUsers.push(mockUser1)
        mockConversations.push(mockConversation1)
        mockConversations.push(mockConversation2)

        mockErrorMsg = "Error in finding tutor"

        const res = await request(app)
            .get(ENDPOINT)

        expect(res.status).toBe(500)        
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
    }) 
})
