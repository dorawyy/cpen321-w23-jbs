const { AppointmentStatus } = require("../constants/appointment.status")
const db = require("../db")
const Appointment = require("../db/appointment.model")
const appointmentController = require("./appointment.controller")
const User = db.user

exports.addReview = async (req, res) => {
    try {
        if (!req.body.appointmentId) {
            return res.status(400).send({message: "appointmentId is required"})
        }
        
        var appointmentIsAccepted = await appointmentController
            .appointmentIsAccepted(req.body.appointmentId)
            
        var appointmentIsCompleted = await appointmentController
            .appointmentIsCompleted(req.body.appointmentId)
        
        if (!appointmentIsAccepted) {
            return res.status(403).send({ 
                message: "The appointment hasn't been accepted" 
            })
        }
        if (!appointmentIsCompleted) {
            return res.status(403).send({ 
                message: "The appointment hasn't completed" 
            })
        }
    
        var appointment = await Appointment.findById(req.body.appointmentId)
    
        var reviewerId = req.userId
        var reviewerDisplayedName = await User
            .findById(reviewerId, ["displayedName", "-_id"])
            .then(user => {
                if (!user || user.isBanned) {
                    return res.status(400).send({message: "user not found"})
                }
                return user.displayedName
            })
            
        var userReview = {
            reviewerId,
            reviewerDisplayedName,
            ...req.body
        }
    
        var receiver = await User
            .findById(req.body.receiverId)
            .then(user => {
                if (!user || user.isBanned) {
                    return res.status(400).send({message: "user not found"})
                }
                return user
            })
        
        receiver.userReviews.push(userReview)
        receiver.overallRating = this.getOverallRating(receiver.userReviews)
    
        var ret = await receiver.save()
            .then(user => {
                if (!user || user.isBanned) {
                    return res.status(400).send({message: "user not found"})
                }
                var ret = {
                    overallRating: user.overallRating,
                    userReviews: user.userReviews
                }
                return ret
            })
    
        for (var i = 0; i < 2; i++) {
            var participant = appointment.participantsInfo[i]
            if (participant.userId == req.body.receiverId) {
                appointment.participantsInfo[i].noShow = req.body.noShow,
                appointment.participantsInfo[i].late = req.body.late
            }
        }
    
        appointment.save().then(result => {
            return res.status(200).send(ret)
        })
    } catch (err) {
        console.log(err)
        return res.status(500).send({message: err.message})
    } 
}

exports.getUserReviews = (req, res) => {
    try {
        var userId = req.query.userId
        if (!userId) {
            return res.status(400).send({ message: "Must specify userId" })
        }
        User.findById(userId, "userReviews").then(user => {
            if (!user) {
                return res.status(404).send({ message: "User not found" })
            }
            return res.status(200).send(user)
        })
    } catch (err) {
        console.log(err.message)
        return res.status(500).send({ message: err.message })
    }
}

exports.getOverallRating = (userReviews) => {
    if (userReviews.length == 0) {
        return 0
    }
    var sum = 0
    for (reviews of userReviews) {
        sum += reviews.rating
    }
    return sum/userReviews.length
}


