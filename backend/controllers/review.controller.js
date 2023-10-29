const db = require("../db")
const appointmentController = require("./appointment.controller")
const User = db.user

exports.addReview = async (req, res) => {
    // comment this out for now to integrate addReview cuz we havent
    // added bookAppointment endpoint
    // var appointmentIsCompleted = await appointmentController
    //     .appointmentIsCompleted(req.body.appointmentId)
    // if (!appointmentIsCompleted) {
    //     res.status(403).send({ message: "The appointment hasn't completed" })
    // }

    var reviewerId = req.userId
    var reviewerDisplayedName = await User
        .findById(reviewerId, ["displayedName", "-_id"])
        .then(user => {
            if (!user || user.isBanned) {
                return res.status(400).send({message: "user not found"})
            }
            return user.displayedName
        })
        .catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
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
        .catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
        })
    
    receiver.userReviews.push(userReview)
    receiver.overallRating = this.getOverallRating(receiver.userReviews)

    receiver.save()
        .then(user => {
            if (!user || user.isBanned) {
                return res.status(400).send({message: "user not found"})
            }
            var ret = {
                overallRating: user.overallRating,
                userReviews: user.userReviews
            }
            return res.status(200).send(ret)
        }).catch(err => {
            console.log(err)
            return res.status(500).send({ message: err.message })
        })
}

exports.getUserReviews = (req, res) => {
    var userId = req.query.userId
    if (!userId) {
        return res.status(400).send({ message: "Must specify userId" })
    }
    User.findById(userId, "userReviews").then(user => {
        if (!user) {
            res.status(404).send({ message: "User not found" })
            return
        }
        res.status(200).send(user)
        return
    }).catch(err => {
        console.log(err.message)
        return res.status(500).send({ message: err.message })
    })
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


