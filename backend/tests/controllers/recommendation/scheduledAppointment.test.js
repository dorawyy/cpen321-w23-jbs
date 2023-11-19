const request = require('supertest')
const mongoose = require("mongoose")
const db = require("../../../db")
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils')
const { UserType } = require('../../../constants/user.types')
const { LocationMode } = require('../../../constants/location.modes')
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../../controllers/auth.controller')

const ORIGINAL_RECOMMENDATION_WEIGHTS = {
    budget: 50,
    minRating: 3,
    locationModeWeight: 0.5,
    maxDistance: 20
}

const ENDPOINT = "/user_action/scheduled_appointment"


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
    }
    return {
        user: MockUser,
    }
})

jest.mock("../../../middleware")

beforeEach(() => {
    mockErrorMsg = undefined
    mockAddedUsers = []
})

const User = db.user

// Interface POST https://edumatch.canadacentral.cloudapp.azure.com/user_action/scheduled_appointment
describe("Scheduled appointment", () => {
    const mockTuteeId = new mongoose.Types.ObjectId()
    const mockTutorId = new mongoose.Types.ObjectId()
    
    var mockTutee = {
        _id: mockTuteeId,
        googleId: null,
        isBanned: false,
        googleOauth: null,
        type: UserType.TUTEE,
        username: "testuser",
        password: "blablablaba",
        email: "testemail@test.com",
        displayedName: "Test user",
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
        hasSignedUp: true,
        save: async() => {
            return
        }
    }
    
    var mockTutor = {
        _id: mockTutorId,
        googleId: null,
        isBanned: false,
        googleOauth: null,
        type: UserType.TUTOR,
        username: "testuser2",
        password: "blablablaba2",
        email: "testemail2@test.com",
        displayedName: "Test user2",
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
        subjectHourlyRate: [
            {
                course: "APSC 101",
                hourlyRate: 200
            }
        ]
    }

    authJwt.verifyJwt.mockImplementation((req, res, next) => {
        req.userId = mockTuteeId
        return next()
    })

    // User is not banned
    account.verifyAccountStatus.mockImplementation((req, res, next) => {
        return next()
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) tutorId is valid, exists, and not banned, with locationMode == in person and valid location coordinates
    //  (2) userId is valid, exists, and not banned, with locationMode == in person and valid location coordinates
    //  (3) scheduledSubject is a subject that the tutor offers
    // Expected status code: 200
    // Expected behavior: tutee’s budget, minRating, locationModeWeight, maxDistance in recommendationWeights are updated correctly
    // Expected output: Success message
    test('Should pass when ids, locationMode, recommendationWeights are valid', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push(mockTutor)

        const mockRequestBody = {
            tutorId: mockTutorId,
            scheduledSubject: "APSC 101"
        }

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(200)
        expect(res.body).toEqual({ 
            message: "Adjusted weights based on scheduled appointment"
        })
        expect(mockAddedUsers.find(user => user._id == mockTuteeId).recommendationWeights).not.toBe(ORIGINAL_RECOMMENDATION_WEIGHTS)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) db throws an error upon query
    // Expected status code: 500
    // Expected behavior: Database is unchanged
    // Expected output: Error message
    test('Should fail when tutorId query throws error', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push(mockTutor)

        const mockRequestBody = {
            tutorId: mockTutorId,
            scheduledSubject: "APSC 101"
        }

        mockErrorMsg = "Error in finding tutor"

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(500)        
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
        expect(mockAddedUsers.find(user => user._id == mockTuteeId).recommendationWeights).toBe(DEFAULT_RECOMMENDATION_WEIGHTS)
    }) 

    // ChatGPT Usage: No
    // Input: 
    //  (1) tutorId is valid, exists, and banned
    // Expected status code: 404
    // Expected behavior: Database is unchanged
    // Expected output: Error message
    test('Should fail when tutor is banned', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push({
           ...mockTutor,
           isBanned: true
        })

        const mockRequestBody = {
            tutorId: mockTutorId,
            scheduledSubject: "APSC 101"
        }

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(404)   
        expect(res.body).toEqual({ 
            message: "Could not find tutor in database with provided id"
        })     
        expect(mockAddedUsers.find(user => user._id == mockTuteeId).recommendationWeights).toBe(DEFAULT_RECOMMENDATION_WEIGHTS)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) scheduledSubject that is not found in tutor subjectHourlyRate
    // Expected status code: 500
    // Expected behavior: Database is unchanged
    // Expected output: Error message
    test('Should fail when scheduledSubject is not found', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push(mockTutor)

        const mockRequestBody = {
            tutorId: mockTutorId,
            scheduledSubject: "MATH 101"
        }

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(500)   
        expect(res.body).toEqual({ 
            message: "Unable to find hourly rate associated with subject"
        })     
        expect(mockAddedUsers.find(user => user._id == mockTuteeId).recommendationWeights).toBe(DEFAULT_RECOMMENDATION_WEIGHTS)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) tutorId for a tutor with missing fields
    // Expected status code: 200
    // Expected behavior: Database is unchanged
    // Expected output: Success message
    test('Should pass when tutor fields are missing', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push({
            ...mockTutor,
            overallRating: undefined,
            location: undefined,
            subjectHourlyRate: undefined
        })

        const mockRequestBody = {
            tutorId: mockTutorId,
            scheduledSubject: "APSC 101"
        }

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(200)   
        expect(res.body).toEqual({ 
            message: "Adjusted weights based on scheduled appointment"
        })     
        expect(mockAddedUsers.find(user => user._id == mockTuteeId).recommendationWeights).toBe(DEFAULT_RECOMMENDATION_WEIGHTS)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) tutorId for a tutor with opposing values to the tutee's recommendationWeights
    // Expected status code: 200
    // Expected behavior: tutee’s recommendationWeights are updated correctly
    // Expected output: Success message
    test('Should pass when tutor has opposing values to tutee', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push({
            ...mockTutor,
            overallRating: 5,
            location: {
                lat: 123,
                long: 456
            },
            subjectHourlyRate: [
                {
                    course: "APSC 101",
                    hourlyRate: 20
                }
            ]
        })

        const mockRequestBody = {
            tutorId: mockTutorId,
            scheduledSubject: "APSC 101"
        }

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(200)   
        expect(res.body).toEqual({ 
            message: "Adjusted weights based on scheduled appointment"
        })     
        expect(mockAddedUsers.find(user => user._id == mockTuteeId).recommendationWeights).not.toBe(ORIGINAL_RECOMMENDATION_WEIGHTS)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) tutorId for a tutor who has different locationMode
    // Expected status code: 200
    // Expected behavior: tutee’s recommendationWeights are updated correctly
    // Expected output: Success message
    test('Should pass when tutor has different locationMode', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push({
            ...mockTutor,
            locationMode: LocationMode.ONLINE
        })

        const mockRequestBody = {
            tutorId: mockTutorId,
            scheduledSubject: "APSC 101"
        }

        const res = await request(app)
            .post(ENDPOINT)
            .set('Authorization', 'Bearer mockToken')
            .send(mockRequestBody);

        expect(res.status).toBe(200)   
        expect(res.body).toEqual({ 
            message: "Adjusted weights based on scheduled appointment"
        })     
        expect(mockAddedUsers.find(user => user._id == mockTuteeId).recommendationWeights).not.toBe(ORIGINAL_RECOMMENDATION_WEIGHTS)
    })
})
