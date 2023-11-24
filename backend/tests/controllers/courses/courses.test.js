const axios = require("axios")
const request = require('supertest');
const { app } = require("../../utils/express.mock.utils");

const ENDPOINT = "/courses"
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
        var expectedData = [
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
                        course: courseCode.replace("CPEN ", ""),
                        course_title: "Course title"
                    }
                }
            )
        }

        expectedData = expectedData.map(courseCode => {
            return {
                code: courseCode,
                title: "Course title"
            }
        })

        axios.get.mockResolvedValue(mockUbcGradesResponse)
        const res = await request(app)
            .get(ENDPOINT)
            .query({ code })
        
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            courses: expectedData
        })
    })

    // ChatGPT usage: No
    // Input: the query `code` is a valid program + some course code prefix
    // Expected status code: 200
    // Expected behavior: Process the output from UBCGrades API to find courses
    // that match the prefix
    // Expected output: a list of courses that match the prefix
    test("Valid program code with some prefix", async () => {
        const code = "CPEN 3"
        var expectedData = [
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
                        course: courseCode.replace("CPEN ", ""),
                        course_title: "Course title"
                    }
                }
            )
        }
        expectedData = [
            "CPEN 311",
            "CPEN 312",
            "CPEN 321",
            "CPEN 322",
            "CPEN 331",
            "CPEN 333",
            "CPEN 391",
        ]
        expectedData = expectedData.map(courseCode => {
            return {
                code: courseCode,
                title: "Course title"
            }
        })

        axios.get.mockResolvedValue(mockUbcGradesResponse)
        const res = await request(app)
            .get(ENDPOINT)
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
            .get(ENDPOINT)

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ 
            message: 'code is required' 
        });
    })

    // ChatGPT usage: Yes
    // Input: the query `code` is an invalid program
    // Expected status code: 200
    // Expected behavior: catch the ubcgrades api error
    // Expected output: empty list
    test("Invalid query, 3rd party API error should return empty list", async () => {
        const errorMessage = 'Internal Server Error';
        axios.get.mockRejectedValue(new Error(errorMessage));
        const res = await request(app)
            .get(ENDPOINT)
            .query({ code: "invalid code" })
            
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ courses: [] });
    })
})

