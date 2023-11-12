const express = require('express');
const authRoutes = require("../../routes/auth.routes")
const userRoutes = require("../../routes/user.routes")
const recommendationRoutes = require("../../routes/recommendation.routes")
const browseRoutes = require("../../routes/browse.routes")
const reviewRoutes = require("../../routes/review.routes")
const appointmentRoutes = require("../../routes/appointment.routes")
const adminRoutes = require("../../routes/admin.routes")
const conversationRoutes = require("../../routes/conversation.routes")

const app = express();

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname, { dotfiles: 'allow' } ));

authRoutes(app)
userRoutes(app)
recommendationRoutes(app)
browseRoutes(app)
reviewRoutes(app)
appointmentRoutes(app)
adminRoutes(app)
conversationRoutes(app)

// ChatGPT usage: Yes
function initReqResMock() {
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

module.exports = {
    app, initReqResMock
}