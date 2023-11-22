const request = require('supertest')
const mongoose = require("mongoose")
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils')
const { UserType } = require('../../../constants/user.types')
const { LocationMode } = require('../../../constants/location.modes')
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../../controllers/auth.controller')

const ENDPOINT = "/conversation/create"


const mockUserId1 = new mongoose.Types.ObjectId()
const mockUserId2 = new mongoose.Types.ObjectId()
const mockConversationId1 = new mongoose.Types.ObjectId()
const mockConversationId2 = new mongoose.Types.ObjectId()

var mockErrorMsg
var mockAddedUsers
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
        static findOne = jest.fn((id) => {
            return Promise.resolve(mockConversations[0])
        })

        save = jest.fn(() => {
            mockConversations.push(this)
            return Promise.resolve(this)
        })
    }
    return {
        user: MockUser,
        conversation: MockConversation
    }
})

jest.mock("../../../middleware")

// Interface POST https://edumatch.canadacentral.cloudapp.azure.com/conversation/create
describe("Create new conversation", () => { 
    let mockUser1 = {
        _id: mockUserId1,
        googleId: null,
        isBanned: false,
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
    let mockUser2 = {
        _id: mockUserId2,
        googleId: null,
        isBanned: false,
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
    let mockConversation1 = {
        _id: mockConversationId1,
        participants: {
            userId1: mockUserId1.toString(),
            userId2: mockUserId2.toString(),
            displayedName1: "B",
            displayedName2: "C"
        },
        messages: []
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
    //  (1) otherUserId of a user who exists and is not banned, and with whom the user does not already have a conversation
    // Expected status code: 200
    // Expected behavior: New conversation is created in database
    // Expected output: Newly created conversation
    test('Should pass when other user is not banned and conversation does not already exist', async() => {
        mockAddedUsers.push(mockUser1)
        mockAddedUsers.push(mockUser2)

        const mockRequestBody = {
            otherUserId: mockUserId2
        }

        const res = await request(app)
            .post(ENDPOINT)
            .send(mockRequestBody)

        expect(res.status).toBe(200)
        expect(res.body.conversationName).toEqual("C")
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) db throws an error upon query
    // Expected status code: 500
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when userId query throws error', async() => {
        mockAddedUsers.push(mockUser1)
        mockAddedUsers.push(mockUser2)

        const mockRequestBody = {
            otherUserId: mockUserId2
        }

        mockErrorMsg = "Error in finding user"

        const res = await request(app)
            .post(ENDPOINT)
            .send(mockRequestBody)

        expect(res.status).toBe(500)        
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
    }) 

    // ChatGPT Usage: No
    // Input: 
    //  (1) otherUserId of a user who exists and is banned
    // Expected status code: 404
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when other user is banned', async() => {
        mockAddedUsers.push(mockUser1)
        mockAddedUsers.push({
            ...mockUser2,
            isBanned: true
        })

        const mockRequestBody = {
            otherUserId: mockUserId2
        }

        const res = await request(app)
            .post(ENDPOINT)
            .send(mockRequestBody)

        expect(res.status).toBe(404)        
        expect(res.body).toEqual({ 
            message: "Could not find other user in database with provided id"
        })
    }) 

    // ChatGPT Usage: No
    // Input: 
    //  (1) otherUserId of a user who exists and is not banned, and with whom the user already has a conversation
    // Expected status code: 404
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when conversation already exists', async() => {
        mockAddedUsers.push(mockUser1)
        mockAddedUsers.push(mockUser2)
        mockConversations.push(mockConversation1)

        const mockRequestBody = {
            otherUserId: mockUserId2
        }

        const res = await request(app)
            .post(ENDPOINT)
            .send(mockRequestBody)

        expect(res.status).toBe(400)        
        expect(res.body).toEqual({ 
            message: "There already exists a conversation between these two users in the database"
        })
    }) 
})
