const axios = require("axios")
const request = require('supertest');
const { getCourseCodes } = require("../../controllers/courses.controller")
const { initReqResMock, app } = require("../utils/express.mock.utils");

jest.mock('axios')

// Interface GET https://edumatch.canadacentral.cloudapp.azure.com/courses
describe("Get course codes", () => {
    // ChatGPT usage: Yes
    // Input: the query `code` is a valid program
    // Expected status code: 200
    // Expected behavior: Returns a list of course codes of the program
    // Expected output: a list of course codes of the program
    test("Valid program code", async () => {
        const code = "CPEN"
        const expectedData = [
            "CPEN 211",
            "CPEN 212",
            "CPEN 221",
            "CPEN 223",
            "CPEN 281",
            "CPEN 291",
            "CPEN 311",
            "CPEN 312",
            "CPEN 321",
            "CPEN 322",
            "CPEN 331",
            "CPEN 333",
            "CPEN 391",
            "CPEN 400",
            "CPEN 411",
            "CPEN 412",
            "CPEN 421",
            "CPEN 431",
            "CPEN 432",
            "CPEN 441",
            "CPEN 442",
            "CPEN 481",
            "CPEN 491",
        ]

        const mockUbcGradesResponse =  {
            data: expectedData.map(
                courseCode => {
                    return {
                        course: courseCode.replace("CPEN ", "")
                    }
                }
            )
        }
        axios.get.mockResolvedValue(mockUbcGradesResponse)
        const res = await request(app)
            .get("/courses")
            .query({ code })
        
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            courses: expectedData
        })
    })

    // ChatGPT usage: Yes
    // Input: the query `code` is empty
    // Expected status code: 400
    // Expected behavior: none. UBCGrades API shouldn't be called
    // Expected output: a message saying `code` is required
    test("Empty query", async () => {
        const res = await request(app)
            .get("/courses")

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ 
            message: 'code is required' 
        });
    })

    // ChatGPT usage: Yes
    // Input: the query `code` is an invalid program
    // Expected status code: 500
    // Expected behavior: sends back UBCGrades API error message
    // Expected output: UBCGrades API error message
    test("Invalid query, 3rd party API error", async () => {
        const errorMessage = 'Internal Server Error';
        axios.get.mockRejectedValue(new Error(errorMessage));
        const res = await request(app)
            .get("/courses")
            .query({ code: "invalid code" })
            
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ message: errorMessage });
            
    })
})

