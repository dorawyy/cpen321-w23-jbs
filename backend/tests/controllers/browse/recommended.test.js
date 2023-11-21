const request = require('supertest')
const mongoose = require("mongoose")
const { authJwt, account } = require("../../../middleware")
const { app } = require('../../utils/express.mock.utils')
const { UserType } = require('../../../constants/user.types')
const { LocationMode } = require('../../../constants/location.modes')
const { DEFAULT_RECOMMENDATION_WEIGHTS } = require('../../../controllers/auth.controller')

const ENDPOINT = "/recommended"


var mockErrorMsg
var mockAddedUsers = []
var mockAddedTutorsWithoutCourses = []
var mockFindNum

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
        static find = jest.fn(() => {
            if (mockFindNum == 0) {
                mockFindNum++
                return mockAddedUsers.slice(1)
            } else {
                return mockAddedTutorsWithoutCourses
            }
        })
    }
    return {
        user: MockUser
    }
})

jest.mock("../../../middleware")

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/recommended
describe("Browse for users", () => {
    const mockTuteeId = new mongoose.Types.ObjectId()
    const mockTutorWithCourseId = new mongoose.Types.ObjectId()
    const mockTutorWithCourseAndOppositeValuesId = new mongoose.Types.ObjectId()
    const mockTutorWithoutCourseId = new mongoose.Types.ObjectId()

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
    let mockTutorWithCourse = {
        _id: mockTutorWithCourseId,
        googleId: null,
        isBanned: false,
        googleOauth: null,
        type: UserType.TUTOR,
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
        hasSignedUp: true,
        subjectHourlyRate: [
            {
                course: "CPEN 321",
                hourlyRate: 5
            }
        ]
    }
    let mockTutorWithCourseAndOppositeValues = {
        _id: mockTutorWithCourseAndOppositeValuesId,
        googleId: null,
        isBanned: false,
        googleOauth: null,
        type: UserType.TUTOR,
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
        locationMode: LocationMode.ONLINE,
        location: {
            lat: 85,
            long: 175
        },
        recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS,
        bio: "test bio",
        useGoogleCalendar: false,
        userReviews: [],
        overallRating: 5,
        appointments: [{
            _id: "test appointment id",
            pstStartDateTime: "test date time",
            pstEndDateTime: "test end date time"
        }],
        hasSignedUp: true,
        subjectHourlyRate: [
            {
                course: "CPEN 321",
                hourlyRate: 2000
            }
        ]
    }
    let mockTutorWithoutCourse = {
        _id: mockTutorWithoutCourseId,
        googleId: null,
        isBanned: false,
        googleOauth: null,
        type: UserType.TUTOR,
        username: "testuser",
        password: "blablablaba",
        email: "testemail@test.com",
        displayedName: "A",
        phoneNumber: "123-456-789",
        education: {
            school: "test school",
            program: "test program",
            level: 1,
            courses: ["CPSC 320"],
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
            long: -175
        },
        recommendationWeights: DEFAULT_RECOMMENDATION_WEIGHTS,
        bio: "test bio",
        useGoogleCalendar: false,
        userReviews: [],
        overallRating: 5,
        appointments: [{
            _id: "test appointment id",
            pstStartDateTime: "test date time",
            pstEndDateTime: "test end date time"
        }],
        hasSignedUp: true,
        subjectHourlyRate: [
        ]
    }

    beforeEach(() => {
        mockErrorMsg = undefined
        mockAddedUsers = []
        mockAddedTutorsWithoutCourses = []
        mockFindNum = 0
    })

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
    //  (1) page is >= 1
    //  (2) courses is specified
    // Expected status code: 200
    // Expected behavior: List of tutors is returned
    // Expected output: List of tutors
    test('Should pass when page is valid and courses are specified', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push(mockTutorWithCourse)
        mockAddedUsers.push({
            ...mockTutorWithCourse,
            _id: new mongoose.Types.ObjectId()
        })

        const res = await request(app)
            .get(ENDPOINT)
            .query({ courses: ["CPEN 321"], page: 1 })

        expect(res.status).toBe(200)
        expect(res.body.tutors.length).toEqual(2)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) page is < 1
    // Expected status code: 200
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when page is less than 0', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push(mockTutorWithCourse)
        mockAddedUsers.push({
            ...mockTutorWithCourse,
            _id: new mongoose.Types.ObjectId()
        })

        const res = await request(app)
            .get(ENDPOINT)
            .query({ courses: "CPEN 321", page: 0 })

        expect(res.status).toBe(400)
        expect(res.body).toEqual({ 
            message: "Page number cannot be less than 1"
        })
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) db throws an error upon query
    // Expected status code: 500
    // Expected behavior: N/A
    // Expected output: Error message
    test('Should fail when userId query throws error', async() => {
        mockAddedUsers.push(mockTutee)
        mockAddedUsers.push(mockTutorWithCourse)

        mockErrorMsg = "Error in finding user"

        const res = await request(app)
            .get(ENDPOINT)
            .query({ page: 1 })

        expect(res.status).toBe(500)
        expect(res.body).toEqual({ 
            message: mockErrorMsg
        })
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) page is >= 1
    //  (2) courses is not specified
    //  (3) tutee does not have courses in education field
    // Expected status code: 200
    // Expected behavior: List of tutors is returned
    // Expected output: List of tutors
    test('Should pass when courses are not specified and tutee has no courses in education field', async() => {
        mockAddedUsers.push({
            ...mockTutee,
            education: undefined
        })
        mockAddedUsers.push(mockTutorWithCourse)
        mockAddedUsers.push(mockTutorWithoutCourse)

        const res = await request(app)
            .get(ENDPOINT)
            .query({ page: 1 })

        expect(res.status).toBe(200)
        expect(res.body.tutors.length).toEqual(2)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) page corresponds to less than number of tutors returned
    //  (2) courses is not specified
    //  (3) tutee has courses in education field
    // Expected status code: 200
    // Expected behavior: List of tutors is returned
    // Expected output: List of tutors
    test('Should pass when courses are not specified and tutee has courses in education field and page corresponds to less than number of tutors returned', async() => {
        mockAddedUsers.push(mockTutee)
        for (var i = 0; i < 105; i++) {
            mockAddedUsers.push(mockTutorWithCourseAndOppositeValues)
        }

        const res = await request(app)
            .get(ENDPOINT)
            .query({ page: 1 })

        expect(res.status).toBe(200)
        expect(res.body.tutors.length).toEqual(100)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) page corresponds to some tutors with courses and some without
    //  (2) courses is not specified
    //  (3) tutee has courses in education field
    // Expected status code: 200
    // Expected behavior: List of tutors is returned
    // Expected output: List of tutors
    test('Should pass when courses are not specified and tutee has courses in education field and page corresponds to some tutors with courses and some without', async() => {
        mockAddedUsers.push(mockTutee)
        for (var i = 0; i < 50; i++) {
            mockAddedUsers.push(mockTutorWithCourseAndOppositeValues)
        }
        for (var i = 0; i < 5; i++) {
            mockAddedTutorsWithoutCourses.push(mockTutorWithoutCourse)
        }

        const res = await request(app)
            .get(ENDPOINT)
            .query({ page: 1 })

        expect(res.status).toBe(200)
        expect(res.body.tutors.length).toEqual(55)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) page corresponds to greater than number of tutors returned
    //  (2) courses is not specified
    //  (3) tutee has courses in education field
    // Expected status code: 200
    // Expected behavior: List of tutors is returned
    // Expected output: List of tutors
    test('Should pass when courses are not specified and tutee has courses in education field and page corresponds to less than number of tutors returned', async() => {
        mockAddedUsers.push(mockTutee)
        for (var i = 0; i < 10; i++) {
            mockAddedTutorsWithoutCourses.push(mockTutorWithoutCourse)
        }

        const res = await request(app)
            .get(ENDPOINT)
            .query({ page: 1 })

        expect(res.status).toBe(200)
        expect(res.body.tutors.length).toEqual(10)
    })

    // ChatGPT Usage: No
    // Input: 
    //  (1) page is >= 1
    //  (2) courses is specified
    //  (3) tutee prefers online
    // Expected status code: 200
    // Expected behavior: List of tutors is returned
    // Expected output: List of tutors
    test('Should pass when page is valid and courses are specified and tutee prefers online', async() => {
        mockAddedUsers.push({
            ...mockTutee,
            locationMode: LocationMode.ONLINE
        })
        mockAddedUsers.push(mockTutorWithCourse)
        mockAddedUsers.push({
            ...mockTutorWithCourse,
            _id: new mongoose.Types.ObjectId()
        })

        const res = await request(app)
            .get(ENDPOINT)
            .query({ courses: ["CPEN 321"], page: 1 })

        expect(res.status).toBe(200)
        expect(res.body.tutors.length).toEqual(2)
    })
})
