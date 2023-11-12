// ChatGPT usage: Yes
exports.initReqResMock = () => {
    var req = {}
    const resSendMock = jest.fn()
    var res = {
        status: jest.fn(() => {
            return {
                send: resSendMock
            }
        })
    }
    return {req, res, resSendMock}
}