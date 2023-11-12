const crypto = require("crypto")
const jwt = require('jsonwebtoken');
const { verifyJwt } = require('../../middleware/authJwt');
const { initReqResMock } = require('../utils/express.mock.utils');

SECRET_KEY = process.env.SECRET_KEY

describe("Verify JWT", () => {
    // ChatGPT usage: Yes
    test("Verify a valid JWT", async () => {
        var userId = crypto.randomBytes(12).toString('hex')
        const jwtToken = jwt.sign(userId, SECRET_KEY)

        var {req, res, resSendMock} = initReqResMock()
        req.header = jest.fn(() => `Bearer ${jwtToken}`)
        var next = jest.fn()

        await verifyJwt(req, res, next)

        expect(req.userId).toEqual(userId);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    })

    // ChatGPT usage: Yes
    test("Return 403 for no token provided", async () => {
        var {req, res, resSendMock} = initReqResMock()
        req.header = jest.fn()
        var next = jest.fn()

        await verifyJwt(req, res, next)

        expect(res.status).toHaveBeenCalledWith(403);
        expect(resSendMock).toHaveBeenCalledWith({ message: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    })

    // ChatGPT usage: Yes
    test("Return 403 for failed token verification", async () => {
        var userId = crypto.randomBytes(12).toString('hex')
        const jwtToken = jwt.sign(userId, "wrong secret key")
        
        var {req, res, resSendMock} = initReqResMock()
        req.header = jest.fn(() => `Bearer ${jwtToken}`)
        var next = jest.fn()

        await verifyJwt(req, res, next)

        expect(res.status).toHaveBeenCalledWith(403);
        expect(resSendMock).toHaveBeenCalledWith({ message: 'Failed to verify JWT' });
        expect(next).not.toHaveBeenCalled();
    })

    // ChatGPT usage: No
    test("Return 500 for an error", async () => {
        const errorMessage = 'Token verification error';

        var {req, res, resSendMock} = initReqResMock()
        req.header = jest.fn(() => { throw new Error(errorMessage) })
        var next = jest.fn()

        await verifyJwt(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500);
        expect(resSendMock).toHaveBeenCalledWith({ message: errorMessage });
        expect(next).not.toHaveBeenCalled();
    })

})