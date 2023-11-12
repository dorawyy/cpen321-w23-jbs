const axios = require("axios")
const { getCourseCodes } = require("../controllers/courses.controller")
const { initReqResMock } = require("./utils/express.mock.utils")

jest.mock('axios')

describe("Get course codes", () => {
    // ChatGPT usage: Yes
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
        var {req, res, resSendMock} = initReqResMock()
        
        req.query = {
            code
        }
        
        await getCourseCodes(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(resSendMock).toHaveBeenCalledWith({
            courses: expectedData,
        });
    })

    // ChatGPT usage: Yes
    test("Empty query", async () => {
        var {req, res, resSendMock} = initReqResMock()
        req.query = {}
        await getCourseCodes(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(resSendMock).toHaveBeenCalledWith({ 
            message: 'code is required' 
        });
    })

    // ChatGPT usage: Yes
    test("Invalid query, 3rd party API error", async () => {
        const errorMessage = 'Internal Server Error';
        axios.get.mockRejectedValue(new Error(errorMessage));
        var {req, res, resSendMock} = initReqResMock()
        req.query = {
            code: "invalid code"
        }
        
        await getCourseCodes(req, res).catch(err => {
            expect(res.status).toHaveBeenCalledWith(500);
            expect(resSendMock).toHaveBeenCalledWith({ message: errorMessage });
        })
    })
})

