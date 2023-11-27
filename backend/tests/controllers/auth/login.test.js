const bcrypt = require("bcryptjs");
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const db = require("../../../db");
const { UserType } = require("../../../constants/user.types");
const { app } = require('../../utils/express.mock.utils');

SECRET_KEY = process.env.SECRET_KEY

const ENDPOINT = "/api/auth/login"

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


beforeEach(() => {
    mockUnableToCreateUser = false
    mockErrorMsg = undefined
    mockAddedUsers = []
})

const User = db.user


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
            .post(ENDPOINT)
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
            .post(ENDPOINT)
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
            .post(ENDPOINT)
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
            .post(ENDPOINT)
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
