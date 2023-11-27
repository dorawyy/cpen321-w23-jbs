const db = require("../db")
const apptUtils = require("../utils/appointment.utils")

const User = db.user
const Appointment = db.appointment

// ChatGPT usage: No
exports.addReview = async (req, res) => {
    // addReview
    try {        
        if (!req.body.appointmentId) {
            return res.status(400).send({message: "appointmentId is required"})
        }
        
        var appointmentIsAccepted = await apptUtils
            .appointmentIsAccepted(req.body.appointmentId)
              
        var appointmentIsCompleted = await apptUtils
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
        var reviewer = await User.findById(reviewerId)

        var reviewerDisplayedName = reviewer.displayedName
            
        var userReview = {
            reviewerId,
            reviewerDisplayedName,
            ...req.body
        }
    
        var receiver = await User.findById(req.body.receiverId)
        if (!receiver || receiver.isBanned) {
            return res.status(404).send({message: "user not found"})
        }
        
        receiver.userReviews.push(userReview)
        receiver.overallRating = this.getOverallRating(receiver.userReviews)
    
        var updatedReceiver = await receiver.save()

        if (!updatedReceiver || updatedReceiver.isBanned) {
            return res.status(404).send({message: "user not found"})
        }

        var ret = {
            overallRating: updatedReceiver.overallRating,
            userReviews: updatedReceiver.userReviews
        }
            
        for (var i = 0; i < 2; i++) {
            var participant = appointment.participantsInfo[i]
            if (participant.userId == req.body.receiverId) {
                appointment.participantsInfo[i].noShow = req.body.noShow
                appointment.participantsInfo[i].late = req.body.late
            }
        }
    
        await appointment.save() 
        return res.status(200).send(ret)
    } catch (err) {
        console.log(err)
        return res.status(500).send({message: err.message})
    } 
}

// ChatGPT usage: No
exports.getUserReviews = (req, res) => {
    // getUserReviews
    var userId = req.query.userId
    if (!userId) {
        return res.status(400).send({ message: "Must specify userId" })
    }
    User.findById(userId).then(user => {
        if (!user || user.isBanned) {
            return res.status(404).send({ message: "User not found" })
        }
        var ret = {
            _id: user._id.toString(),
            userReviews: user.userReviews
        }
        return res.status(200).send(ret)
    }).catch(err => {
        console.log(err)
        return res.status(500).send({ message: err.message })
    })
    
}

// ChatGPT usage: No
exports.getOverallRating = (userReviews) => {
    // getOverallRating
    if (userReviews.length === 0) {
        return 0
    }
    var sum = 0
    for (var reviews of userReviews) {
        sum += reviews.rating
    }
    return sum/userReviews.length
}
