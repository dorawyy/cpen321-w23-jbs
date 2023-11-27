const crypto = require("crypto")
const db = require("../../db")
const { account } = require("../../middleware")
const { initReqResMock } = require("../utils/express.mock.utils")

jest.mock('../../db')

describe("Verify account status", () => {
    test("Verify an existing and unbanned user", async () => {
        var userId = crypto.randomBytes(12).toString('hex')
        const mockUser = {
            _id: userId,
            isBanned: false
        }

        // Mock the behavior of User.findById
        db.user.findById.mockResolvedValue(mockUser);
        var initResult = initReqResMock()
        var req = initResult.req
        var res = initResult.res
        var next = jest.fn()

        req.userId = userId

        await account.verifyAccountStatus(req, res, next)

        expect(db.user.findById).toHaveBeenCalledWith(userId);
        expect(res.status).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    })

    test("Return 403 for a banned user", async () => {
        var userId = crypto.randomBytes(12).toString('hex')
        const mockUser = {
            _id: userId,
            isBanned: true
        }

        db.user.findById.mockResolvedValue(mockUser);
        var initResult = initReqResMock()
        var req = initResult.req
        var res = initResult.res
        var resSendMock = initResult.resSendMock
        var next = jest.fn()

        req.userId = userId

        await account.verifyAccountStatus(req, res, next)

        expect(db.user.findById).toHaveBeenCalledWith(userId);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(resSendMock).toHaveBeenCalledWith({
            message: 'User is not found or banned',
        });
    })

    test("Return 403 for nonexisting user", async () => {
        var userId = crypto.randomBytes(12).toString('hex')
        db.user.findById.mockResolvedValue(undefined);

        var initResult = initReqResMock()
        var req = initResult.req
        var res = initResult.res
        var resSendMock = initResult.resSendMock
        var next = jest.fn()

        req.userId = userId

        await account.verifyAccountStatus(req, res, next)

        expect(db.user.findById).toHaveBeenCalledWith(userId);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(resSendMock).toHaveBeenCalledWith({
            message: 'User is not found or banned',
        });
        expect(next).not.toHaveBeenCalled();
    })

    test("Return 500 for an error during user lookup", async () => {
        var userId = crypto.randomBytes(12).toString('hex')
        const errorMessage = 'Database error';
        db.user.findById.mockRejectedValue(new Error(errorMessage));

        var initResult = initReqResMock()
        var req = initResult.req
        var res = initResult.res
        var next = jest.fn()
        req.userId = userId

        await account.verifyAccountStatus(req, res, next)
            .catch(err => {
                expect(db.user.findById).toHaveBeenCalledWith(userId);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(sendMock).toHaveBeenCalledWith({ message: errorMessage });
                expect(next).not.toHaveBeenCalled();
            })
    })
})