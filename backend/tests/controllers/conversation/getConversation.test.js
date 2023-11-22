const request = require('supertest')
const mongoose = require("mongoose")
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils')

const ENDPOINT = "/conversation/get_conversation"


const mockUserId1 = new mongoose.Types.ObjectId()
const mockUserId2 = new mongoose.Types.ObjectId()
const mockConversationId1 = new mongoose.Types.ObjectId()
const mockConversationId2 = new mongoose.Types.ObjectId()

var mockErrorMsg
var mockConversations = []

// ChatGPT Usage: No
jest.mock('../../../db', () => {
    const originalDb = jest.requireActual('../../../db')
    class MockConversation extends originalDb.conversation {
        static findById = jest.fn((id) => {
            if (mockErrorMsg) {
                console.log(mockErrorMsg)
                return Promise.reject(new Error(mockErrorMsg))
            }
            return Promise.resolve(mockConversations[0])
        })
    }
    return {
        conversation: MockConversation
    }
})

jest.mock("../../../middleware")

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/conversation/get_conversation
describe("Get conversation messages", () => { 
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
    let mockConversation2 = {
        _id: mockConversationId2,
        participants: {
            userId1: mockUserId2.toString(),
            userId2: mockUserId1.toString(),
            displayedName1: "C",
            displayedName2: "B"
        },
        messages: []
    }
    let mockMessage1 = {
        senderId: mockUserId1.toString(),
        content: "dummy content 1",
        timestamp: "dummy timestamp 1"
    }
    let mockMessage2 = {
        senderId: mockUserId2.toString(),
        content: "dummy content 2",
        timestamp: "dummy timestamp 2"
    }

    beforeEach(() => {
        mockErrorMsg = undefined
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
    //  (1) conversationId is valid and exists
    //  (2) page number is greater than number of messages
    // Expected status code: 200
    // Expected behavior: List of conversations of user is returned
    // Expected output: List of conversations and id of other user
    test('Should pass when conversationId is valid and page number is greater than number of messages', async() => {
        mockConversations.push(mockConversation1)
        const res = await request(app)
            .get(ENDPOINT)
            .query({ conversationId: mockConversationId1, page: 3 })

        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            otherUserId: mockUserId2.toString(),
            messages: []
        })
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) conversationId is valid and exists
    //  (2) page number is greater than number of messages
    // Expected status code: 200
    // Expected behavior: List of conversations of user is returned
    // Expected output: List of conversations and id of other user
    test('Should pass when conversationId is valid and page number is greater than number of messages for other conversation configuration', async() => {
        mockConversations.push(mockConversation2)
        const res = await request(app)
            .get(ENDPOINT)
            .query({ conversationId: mockConversationId2, page: 3 })

        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            otherUserId: mockUserId2.toString(),
            messages: []
        })
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) conversationId is valid and exists
    //  (2) page number corresponds to the earliest messages
    // Expected status code: 200
    // Expected behavior: List of conversations of user is returned
    // Expected output: List of conversations and id of other user
    test('Should pass when conversationId is valid and page number corresponds to the earliest messages', async() => {
        for (var i = 0; i < 15; i++) {
            mockConversation1.messages.push(mockMessage1)
        }
        mockConversations.push(mockConversation1)
        const res = await request(app)
            .get(ENDPOINT)
            .query({ conversationId: mockConversationId1, page: 2 })

        expect(res.status).toBe(200)
        expect(res.body.otherUserId).toEqual(mockUserId2.toString())
        expect(res.body.messages.length).toEqual(5)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) conversationId is valid and exists
    //  (2) page number corresponds to messages in between
    // Expected status code: 200
    // Expected behavior: List of conversations of user is returned
    // Expected output: List of conversations and id of other user
    test('Should pass when conversationId is valid and page number corresponds to messages in between', async() => {
        for (var i = 0; i < 15; i++) {
            mockConversation2.messages.push(mockMessage2)
        }
        mockConversations.push(mockConversation2)
        const res = await request(app)
            .get(ENDPOINT)
            .query({ conversationId: mockConversationId2, page: 1 })

        expect(res.status).toBe(200)
        expect(res.body.otherUserId).toEqual(mockUserId2.toString())
        expect(res.body.messages.length).toEqual(10)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) db throws an error upon query
    // Expected status code: 500
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when userId query throws error', async() => {
        mockConversations.push(mockConversation1)
        mockConversations.push(mockConversation2)

        mockErrorMsg = "Error in finding user"

        const res = await request(app)
            .get(ENDPOINT)
            .query({ conversationId: mockConversationId1, page: 3 })

        expect(res.status).toBe(500)        
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
    }) 

    // ChatGPT Usage: No
    // Input: 
    //  (1) page < 1
    // Expected status code: 400
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when page < 1', async() => {
        mockConversations.push(mockConversation1)
        mockConversations.push(mockConversation2)

        const res = await request(app)
            .get(ENDPOINT)
            .query({ conversationId: mockConversationId1, page: 0 })

        expect(res.status).toBe(400)        
        expect(res.body).toEqual({ 
            message: "Page number cannot be less than 1"
        })
    }) 

    // ChatGPT Usage: No
    // Input: 
    //  (1) conversationId for a conversation not in database
    // Expected status code: 404
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when conversation is not found', async() => {
        const res = await request(app)
            .get(ENDPOINT)
            .query({ conversationId: mockConversationId1, page: 2 })

        expect(res.status).toBe(404)        
        expect(res.body).toEqual({ 
            message: "Conversation not found"
        })
    }) 
})
