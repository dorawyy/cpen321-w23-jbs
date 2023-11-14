const request = require('supertest');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const mongoose = require('mongoose');

const { MOCKED_VALUES } = require('../../utils/googleapis.mock.utils');
const db = require("../../../db");
const { UserType } = require("../../../constants/user.types");

const { app } = require('../../utils/express.mock.utils');

SECRET_KEY = process.env.SECRET_KEY

const ENDPOINT = "/api/auth/google"

var mockErrorMsg
var mockGoogleErrorMsg
var mockReturnEmptyTokens = false

// ChatGPT Usage: Partial
jest.mock('googleapis', () => {
    return {
        google: {
            auth: {
                OAuth2: jest.fn(() => {
                    return {
                        verifyIdToken: jest.fn(() => {
                            if (mockGoogleErrorMsg) {
                                return Promise.reject(new Error(mockGoogleErrorMsg))
                            }
                            return {
                                getPayload: jest.fn(() => MOCKED_VALUES.payload)
                            }
                        }),
                        getToken: jest.fn(() => {
                            if (mockReturnEmptyTokens) {
                                return {tokens: undefined}
                            }
                            return {
                                tokens: MOCKED_VALUES.tokens
                            }
                        })
                    }
                })
            }
        }
        
    } 
})

var mockAddedUsers = []

var mockUnableToCreateUser = false

// ChatGPT Usage: Partial
jest.mock('../../../db', () => {
    const originalDb = jest.requireActual('../../../db')
    class MockUser extends originalDb.user {
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

beforeEach(() => {
    mockReturnEmptyTokens = false
    mockUnableToCreateUser = false
    mockErrorMsg = undefined
    mockGoogleErrorMsg = undefined
    mockAddedUsers = []
})

const User = db.user

// Interface POST https://edumatch.canadacentral.cloudapp.azure.com/api/auth/google
describe("Google Auth",  () => {
    // ChatGPT Usage: Partial
    // Input: Valid `idToken` and `authCode`
    // Expected status code: 200
    // Expected behavior: Added a new user to database
    // Expected output: The added user
    test('Valid idToken and authCode for a nonexisting user should return a JWT', async () => {
        const mockSavedUser = {
            googleId: MOCKED_VALUES.payload.sub,
            email: MOCKED_VALUES.payload.email,
            displayedName: MOCKED_VALUES.payload.name,
            googleOauth: {
                accessToken: MOCKED_VALUES.tokens.access_token,
                refreshToken: MOCKED_VALUES.tokens.refresh_token,
                expiryDate: MOCKED_VALUES.tokens.expiry_date
            },
            useGoogleCalendar: true,
            isBanned: false
        }

        User.findOne.mockResolvedValueOnce(undefined);
       
        const res = await request(app)
            .post(ENDPOINT)
            .send({ 
                idToken: 'valid-id-token', 
                authCode: 'valid-auth-code' 
            })

        expect(res.status).toBe(200)
        expect(mockAddedUsers.length).toBe(1)
        var addedUser = mockAddedUsers[0]
        
        const jwtToken = jwt.sign(addedUser._id.toString(), SECRET_KEY)
        
        expect(res.body).toEqual({
            jwtToken,
            newUser: true,
            type: null
        })
        expect(User.findOne).toHaveBeenCalledWith({
            googleId: mockSavedUser.googleId
        })
        for (var key of Object.keys(mockSavedUser)) {
            if (key == 'googleOauth') {
                expect(addedUser.googleOauth.accessToken).toEqual(mockSavedUser.googleOauth.accessToken)
                expect(addedUser.googleOauth.refreshToken).toEqual(mockSavedUser.googleOauth.refreshToken)
                expect(addedUser.googleOauth.expiryDate).toEqual(mockSavedUser.googleOauth.expiryDate)
            } else {
                expect(addedUser[key]).toEqual(mockSavedUser[key])
            }
        }
    })

    // ChatGPT usage: No
    // Input: Valid `idToken` and `authCode`
    // Expected status code: 200
    // Expected behavior: Database unchanged
    // Expected output: The existing user
    test('Valid idToken and authCode for an existing user should return a JWT', async () => {
        const mockUser = {
            _id: new mongoose.Types.ObjectId(),
            googleId: MOCKED_VALUES.payload.sub,
            isBanned: false,
            type: UserType.TUTEE
        }

        User.findOne.mockResolvedValueOnce(mockUser);
       
        const res = await request(app)
            .post(ENDPOINT)
            .send({ 
                idToken: 'valid-id-token', 
                authCode: 'valid-auth-code' 
            })

        expect(res.status).toBe(200)
        expect(mockAddedUsers.length).toBe(0)
        
        const jwtToken = jwt.sign(mockUser._id.toString(), SECRET_KEY)
        
        expect(res.body).toEqual({
            jwtToken,
            newUser: false,
            type: UserType.TUTEE
        })
        expect(User.findOne).toHaveBeenCalledWith({
            googleId: mockUser.googleId
        })
    })

    // ChatGPT Usage: Partial
    // Input: Valid `idToken` and `authCode`
    // Expected status code: 404
    // Expected behavior: Database unchanged
    // Expected output: a message saying the user is banned
    test("Banned user should return a 404 status", async () => {
        const mockUser = {
            _id: new mongoose.Types.ObjectId(),
            googleId: MOCKED_VALUES.payload.sub,
            isBanned: true,
            type: UserType.TUTEE
        }
        User.findOne.mockResolvedValueOnce(mockUser)

        const res = await request(app)
            .post(ENDPOINT)
            .send({ 
                idToken: 'valid-id-token', 
                authCode: 'valid-auth-code' 
            })  

        expect(res.status).toBe(404)
        expect(mockAddedUsers.length).toBe(0)
        expect(res.body).toEqual({
            message: "User is banned"
        })
    })

    // ChatGPT Usage: No
    // Input: Valid `idToken` and `authCode`
    // Expected status code: 500
    // Expected behavior: Database unchanged
    // Expected output: error message
    test("Return 500 for a database error", async () => {
        const errorMessage = 'Internal Server Error12';        
        User.findOne.mockRejectedValueOnce(new Error(errorMessage));

        const res = await request(app)
            .post(ENDPOINT)
            .send({ 
                idToken: 'valid-id-token', 
                authCode: 'valid-auth-code' 
            })  

        expect(res.status).toBe(500)
        expect(mockAddedUsers.length).toBe(0)
        expect(res.body).toEqual({
            message: errorMessage
        })
    })

    // ChatGPT Usage: No
    // Input: Invalid `idToken`
    // Expected status code: 500
    // Expected behavior: Database unchanged
    // Expected output: error message
    test("Return 500 for an invalid idToken", async () => {
        mockGoogleErrorMsg  = 'Invalid idToken';        
        const res = await request(app)
            .post(ENDPOINT)
            .send({ 
                idToken: 'invalid-id-token', 
                authCode: 'valid-auth-code' 
            })  

        expect(res.status).toBe(500)
        expect(mockAddedUsers.length).toBe(0)
        expect(res.body).toEqual({
            message: mockGoogleErrorMsg
        })
    })

    // ChatGPT Usage: No
    // Input: Invalid `authCode`
    // Expected status code: 500
    // Expected behavior: Database unchanged
    // Expected output: error message
    test("Return 500 for an invalid authCode", async () => {
        mockGoogleErrorMsg = 'Invalid authCode';        

        const res = await request(app)
            .post(ENDPOINT)
            .send({ 
                idToken: 'valid-id-token', 
                authCode: 'invalid-auth-code' 
            })  

        expect(res.status).toBe(500)
        expect(mockAddedUsers.length).toBe(0)
        expect(res.body).toEqual({
            message: mockGoogleErrorMsg
        })
    })

    // ChatGPT Usage: No
    // Input: Invalid `authCode`
    // Expected status code: 500
    // Expected behavior: Add a new user to the db without setting googleOauth field
    // Expected output: the added user
    test("Empty google access tokens", async () => {
        mockReturnEmptyTokens = true
        User.findOne.mockResolvedValueOnce(undefined);
        const res = await request(app)
            .post(ENDPOINT)
            .send({ 
                idToken: 'valid-id-token', 
                authCode: 'invalid-auth-code' 
            })
        
        expect(res.status).toBe(200)
        expect(mockAddedUsers.length).toBe(1)
        var addedUser = mockAddedUsers[0]
        expect(addedUser.googleOauth).not.toBeDefined()
    })
})