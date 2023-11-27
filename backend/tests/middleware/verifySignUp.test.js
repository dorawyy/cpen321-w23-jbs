const { checkDuplicateUsernameOrEmail } = require('../../middleware/verifySignUp');
const mongoose = require("mongoose")
const { UserType } = require('../../constants/user.types')
const { LocationMode } = require('../../constants/location.modes')
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../controllers/auth.controller')
const { initReqResMock } = require('../utils/express.mock.utils');

const mockTuteeId = new mongoose.Types.ObjectId()

var mockAddedUsers = []
var mockFindFirst
var mockFindSecond

// ChatGPT Usage: No
jest.mock('../../db', () => {
    const originalDb = jest.requireActual('../../db')
    class MockUser extends originalDb.user {
        static findOne = jest.fn((id) => {
            if (mockFindFirst) {
                mockFindFirst = false
                return Promise.resolve()
            } else {
                if (mockFindSecond) {
                    mockFindSecond = false
                    return Promise.resolve()
                } else {
                    return Promise.resolve(mockAddedUsers[0])
                }
            }
        })
    }
    var mockDb = {
        user: MockUser
    }
    return mockDb
})

describe("Verify sign up", () => {

    let mockTutee = {
        _id: mockTuteeId,
        googleId: null,
        isBanned: false,
        googleOauth: null,
        type: UserType.TUTEE,
        username: "testuser",
        password: "blablablaba",
        email: "testemail@test.com",
        displayedName: "A",
        phoneNumber: "123-456-789",
        education: {
            school: "test school",
            program: "test program",
            level: 1,
            courses: ["CPEN 321"],
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
            lat: 85,
            long: 175
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
    
    beforeEach(() => {
        mockAddedUsers = []
        mockFindNum = 0
        mockFindFirst = false
        mockFindSecond = false
    })

    // ChatGPT Usage: No
    test('Should pass when token is provided', async() => {
        var {req, res, resSendMock} = initReqResMock()
        req.header = jest.fn(() => `Bearer mockToken`)
        var next = jest.fn()

        await checkDuplicateUsernameOrEmail(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

    // ChatGPT Usage: No
    test('Should fail when userId query throws error', async() => {        
        var {req, res, resSendMock} = initReqResMock()
        var next = jest.fn()

        await checkDuplicateUsernameOrEmail(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
    })

    // ChatGPT Usage: No
    test('Should fail when username is taken', async() => {
        mockAddedUsers.push(mockTutee)

        var {req, res, resSendMock} = initReqResMock()
        req.header = jest.fn()
        req.body = jest.fn(() => `username mockUsername`)
        var next = jest.fn()

        await checkDuplicateUsernameOrEmail(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(resSendMock).toHaveBeenCalledWith({ message: "Username already exists." })
    })

    // ChatGPT Usage: No
    test('Should fail when email is taken', async() => {
        mockFindFirst = true
        mockAddedUsers.push(mockTutee)

        var {req, res, resSendMock} = initReqResMock()
        req.header = jest.fn()
        req.body = {
            username: "mockUsername",
            email: "mockEmail"
        }
        var next = jest.fn()

        await checkDuplicateUsernameOrEmail(req, res, next)

        expect(next).not.toHaveBeenCalled()
    })

    // ChatGPT Usage: No
    test('Should pass when email and username are not taken', async() => {
        mockFindFirst = true
        mockFindSecond = true
        mockAddedUsers.push(mockTutee)

        var {req, res, resSendMock} = initReqResMock()
        req.header = jest.fn()
        req.body = {
            username: "mockUsername",
            email: "mockEmail"
        }
        var next = jest.fn()

        await checkDuplicateUsernameOrEmail(req, res, next)

        expect(next).not.toHaveBeenCalled()
    })
})
