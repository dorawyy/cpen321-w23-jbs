const bcrypt = require("bcryptjs");
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const mongoose = require('mongoose');
const { MOCKED_VALUES } = require('../utils/googleapis.mock.utils');
const { app } = require('../utils/express.mock.utils');
const { verifySignUp } = require("../../middleware")

const db = require("../../db");
const { UserType } = require("../../constants/user.types");
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require("../../controllers/auth.controller");
SECRET_KEY = process.env.SECRET_KEY

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
                                console.log("line 38")
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
jest.mock('../../db', () => {
    const originalDb = jest.requireActual('../../db')
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

jest.mock("../../middleware")


beforeEach(() => {
    jest.clearAllMocks()
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
            .post('/api/auth/google')
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
            .post('/api/auth/google')
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
            .post('/api/auth/google')
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
            .post('/api/auth/google')
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
            .post('/api/auth/google')
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
            .post('/api/auth/google')
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
            .post('/api/auth/google')
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
            .post('/api/auth/signup')
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
                .post('/api/auth/signup')
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
            .post('/api/auth/signup')
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
            .post('/api/auth/signup')
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
            .post('/api/auth/signup')
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
            .post('/api/auth/signup')
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
            .post('/api/auth/signup')
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
            .post('/api/auth/signup')
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
            .post('/api/auth/signup')
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
            .post('/api/auth/signup')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(addedData);

        expect(res.status).toBe(500)        
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
    })
})

// Interface POST https://edumatch.canadacentral.cloudapp.azure.com/api/auth/login
describe("Login", () => {
    // ChatGPT Usage: Partial
    // Input: correct username and password
    // Expected status code: 200
    // Expected behavior: authenticate the user
    // Expected output: the user's JWT and type
    test("Valid login credentials", async () => {
        const mockUser = {
            _id: new mongoose.Types.ObjectId(),
            username: 'testUser',
            password: bcrypt.hashSync('password123'),
            type: UserType.TUTEE,
        };

        User.findOne.mockResolvedValueOnce(mockUser)
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testUser',
                password: 'password123',
            });
        
        const jwtToken = jwt.sign(mockUser._id.toString(), SECRET_KEY)
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            jwtToken,
            type: mockUser.type
        })
    })

    // ChatGPT Usage: Partial
    // Input: nonexisting username
    // Expected status code: 404
    // Expected behavior: unable to find user in db
    // Expected output: error message saying user is not found or banned
    test('User not found', async () => {
        User.findOne.mockResolvedValueOnce(null);
    
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testUser',
                password: 'password123',
            });
    
        expect(res.status).toBe(404);
        expect(res.body).toEqual(
            {message: 'User is not found or is banned'}
        );
    });


    // ChatGPT Usage: Partial
    // Input: incorrect password
    // Expected status code: 401
    // Expected behavior: unable to authenticate the user
    // Expected output: error message
    test("Incorrect credentials", async () => {
        const mockUser = {
            _id: new mongoose.Types.ObjectId(),
            username: 'testUser',
            password: bcrypt.hashSync('correct-password'),
            type: UserType.TUTEE,
        };

        User.findOne.mockResolvedValueOnce(mockUser)
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testUser',
                password: 'incorrect-password',
            });
        
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            message: 'Username or password is incorrect'
        });

    })

    // ChatGPT Usage: No
    // Input: correct username and password
    // Expected status code: 500
    // Expected behavior: db unchanged
    // Expected output: error message
    test("Return 500 for database error", async () => {
        const errorMessage = "Intenal Server Error"
        User.findOne.mockRejectedValueOnce(new Error(errorMessage))
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testUser',
                password: 'password',
            });
        
        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            message: errorMessage
        });

    })
})
