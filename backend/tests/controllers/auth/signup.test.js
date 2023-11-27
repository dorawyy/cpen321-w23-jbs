const bcrypt = require("bcryptjs");
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { UserType } = require("../../../constants/user.types");
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require("../../../controllers/auth.controller");

const { MOCKED_VALUES } = require('../../utils/googleapis.mock.utils');
const { app } = require('../../utils/express.mock.utils');
const { verifySignUp } = require("../../../middleware")


const SECRET_KEY = process.env.SECRET_KEY

const ENDPOINT = "/api/auth/signup"

var mockErrorMsg
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
    var mockDb = {
        user: MockUser
    }
    return mockDb
})

jest.mock("../../../middleware")


beforeEach(() => {
    mockUnableToCreateUser = false
    mockErrorMsg = undefined
    mockAddedUsers = []
})

// Interface POST https://edumatch.canadacentral.cloudapp.azure.com/api/auth/signup
describe("Manual sign up", () => {
    // ChatGPT Usage: No
    // Input: new user data with nonexisting username and email
    // Expected status code: 200
    // Expected behavior: added new user to the database
    // Expected output: the added user's JWT
    test("Manually sign up a new user (tutor/tutee) successfully", async () => {
        var userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            type: UserType.TUTEE,
        };
        
        // Should pass middleware assuming username/email don't exist
        verifySignUp.checkDuplicateUsernameOrEmail.mockImplementation((req, res, next) => {
            return next()
        })

        const res = await request(app)
            .post(ENDPOINT)
            .send(userData);

        expect(res.status).toBe(200)
        expect(mockAddedUsers.length).toBe(1)
        var addedUser = mockAddedUsers[0]
        
        const jwtToken = jwt.sign(addedUser._id.toString(), SECRET_KEY)
        userData = {
            ...userData,
            hasSignedUp: true
        }

        expect(res.body).toEqual({jwtToken})
        expect(addedUser.recommendationWeights).toBeDefined()
        for (var key of Object.keys(userData)) {
            if (key == 'password') {
                passwordIsValid = bcrypt.compareSync(
                    userData.password,
                    addedUser.password
                )
                expect(passwordIsValid).toBeTruthy()
            } else {
                expect(addedUser[key]).toEqual(userData[key])
            }
            
        }
    })

    // ChatGPT Usage: No
    // Input: new user data with existing username/email
    // Expected status code: 400
    // Expected behavior: database unchanged
    // Expected output: a message saying the username/email already exists
    test("Manually sign up a new user (tutor/tutee) with existing username", async () => {
        var messages = [
            "Username already exists.",
            "Email already exists."
        ]
        var userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            type: UserType.TUTEE,
        };
        for (var message of messages) {
            
            // Should pass middleware assuming username/email don't exist
            verifySignUp.checkDuplicateUsernameOrEmail.mockImplementation((req, res, next) => {
                return res.status(400).send({message})
            })
    
            const res = await request(app)
                .post(ENDPOINT)
                .send(userData);
    
            expect(res.status).toBe(400)
            expect(mockAddedUsers.length).toBe(0)
            expect(res.body).toEqual({message})
        }
    })

    // ChatGPT Usage: No
    // Input: new user data with type == ADMIN
    // Expected status code: 400
    // Expected behavior: database unchanged
    // Expected output: a message saying the username/email already exists
    test("Sign up as an admin should be forbidden", async () => {
        var userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            type: UserType.ADMIN,
        };
        
        // Should pass middleware assuming username/email don't exist
        verifySignUp.checkDuplicateUsernameOrEmail.mockImplementation((req, res, next) => {
            return next()
        })

        const res = await request(app)
            .post(ENDPOINT)
            .send(userData);

        expect(res.status).toBe(403)
        expect(mockAddedUsers.length).toBe(0)
        
        expect(res.body).toEqual({ 
            message: "Signing up as admin is not allowed"
        })
    })

    // ChatGPT Usage: No
    // Input: valid user data
    // Expected status code: 500
    // Expected behavior: database unchanged
    // Expected output: error message
    test("Return 500 for database error", async () => {
        var userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            type: UserType.TUTOR,
        };
        
        // Should pass middleware assuming username/email don't exist
        verifySignUp.checkDuplicateUsernameOrEmail.mockImplementation((req, res, next) => {
            return next()
        })

        mockErrorMsg = "Internal Server Error"
        
        const res = await request(app)
            .post(ENDPOINT)
            .send(userData);

        expect(res.status).toBe(500)
        expect(mockAddedUsers.length).toBe(0)
        
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
    })

    // ChatGPT Usage: No
    // Input: valid user data
    // Expected status code: 500
    // Expected behavior: database unchanged
    // Expected output: error message
    test("Return 500 for unable to create user", async () => {
        var userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            type: UserType.TUTOR,
        };
        
        // Should pass middleware assuming username/email don't exist
        verifySignUp.checkDuplicateUsernameOrEmail.mockImplementation((req, res, next) => {
            return next()
        })

        mockUnableToCreateUser = true
        
        const res = await request(app)
            .post(ENDPOINT)
            .send(userData);

        expect(res.status).toBe(500)
        expect(mockAddedUsers.length).toBe(0)
        
        expect(res.body).toEqual({ 
            message: "Unable to create user"
        })
    })

    // ChatGPT Usage: No
    // Input: user data with empty password
    // Expected status code: 500
    // Expected behavior: database unchanged
    // Expected output: error message
    test("Return 500 for a synchronous error", async () => {
        var userData = {
            username: 'testuser',
            email: 'test@example.com',
            type: UserType.TUTOR,
        };
        
        // Should pass middleware assuming username/email don't exist
        verifySignUp.checkDuplicateUsernameOrEmail.mockImplementation((req, res, next) => {
            return next()
        })
        
        const res = await request(app)
            .post(ENDPOINT)
            .send(userData);

        expect(res.status).toBe(500)
        expect(mockAddedUsers.length).toBe(0)
        expect(res.body).toHaveProperty("message")
    })
})

// Interface POST https://edumatch.canadacentral.cloudapp.azure.com/api/auth/signup
describe("Continue signup after Google Auth", () => {
    // ChatGPT Usage: No
    // Input: valid user data for an existing Google user
    // Expected status code: 200
    // Expected behavior: user entry is updated in db
    // Expected output: JWT of the user
    test("Sign up with valid JWT should update existing user", async () => {
        var existingData = {
            _id: "test-id",
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
        };

        mockAddedUsers.push(existingData)

        const jwtToken = jwt.sign(existingData._id, SECRET_KEY)

        const addedData = {
            type: UserType.TUTOR,
            phoneNumber: "123-456-789"
        }
        
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(addedData);

        expect(res.status).toBe(200)
        expect(mockAddedUsers.length).toBe(1)

        existingData = {
            ...existingData,
            ...addedData,
            recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS,
            hasSignedUp: true
        }

        expect(mockAddedUsers[0]).toEqual(existingData)
        expect(res.body).toEqual({jwtToken})
    })

    // ChatGPT Usage: Partial
    // Input: valid user data, invalid JWT
    // Expected status code: 403
    // Expected behavior: db is unchanged
    // Expected output: error message
    test('Sign up with invalid JWT should return Forbidden', async () => {
        const addedData = {
            type: UserType.TUTOR,
            phoneNumber: "123-456-789"
        }
    
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer invalid-token')
            .send(addedData);
    
        expect(res.status).toBe(403);
        expect(res.body).toEqual({message: 'Failed to verify JWT'});
    });

    // ChatGPT Usage: No
    // Input: valid user data for an existing and banned Google user
    // Expected status code: 404
    // Expected behavior: db unchanged
    // Expected output: error message
    test("Continue sign up for an banned user should return 404 not found", async () => {
        var existingData = {
            _id: "test-id",
            googleId: MOCKED_VALUES.payload.sub,
            email: MOCKED_VALUES.payload.email,
            displayedName: MOCKED_VALUES.payload.name,
            googleOauth: {
                accessToken: MOCKED_VALUES.tokens.access_token,
                refreshToken: MOCKED_VALUES.tokens.refresh_token,
                expiryDate: MOCKED_VALUES.tokens.expiry_date
            },
            useGoogleCalendar: true,
            isBanned: true
        };

        mockAddedUsers.push(existingData)

        const jwtToken = jwt.sign(existingData._id, SECRET_KEY)

        const addedData = {
            type: UserType.TUTOR,
            phoneNumber: "123-456-789"
        }
        
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(addedData);

        expect(res.status).toBe(404)
        expect(mockAddedUsers.length).toBe(1)

        existingData = {
            ...existingData,
            ...addedData,
            recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS,
            hasSignedUp: true
        }

        expect(mockAddedUsers[0]).toEqual(existingData)
        expect(res.body).toHaveProperty("message")
    })

    // ChatGPT Usage: No
    // Input: valid user data
    // Expected status code: 500
    // Expected behavior: database unchanged
    // Expected output: error message
    test("Return 500 for database error", async () => {
        var existingData = {
            _id: "test-id",
            googleId: MOCKED_VALUES.payload.sub,
            email: MOCKED_VALUES.payload.email,
            displayedName: MOCKED_VALUES.payload.name,
            googleOauth: {
                accessToken: MOCKED_VALUES.tokens.access_token,
                refreshToken: MOCKED_VALUES.tokens.refresh_token,
                expiryDate: MOCKED_VALUES.tokens.expiry_date
            },
            useGoogleCalendar: true,
            isBanned: true
        };
        
        const jwtToken = jwt.sign(existingData._id, SECRET_KEY)

        mockErrorMsg = "Internal Server Error"
        
        const addedData = {
            type: UserType.TUTOR,
            phoneNumber: "123-456-789"
        }
        
        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(addedData);

        expect(res.status).toBe(500)        
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
    })
})
