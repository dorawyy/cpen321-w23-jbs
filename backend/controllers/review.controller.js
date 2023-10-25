const db = require("../db")
const User = db.user

exports.addReview = async (req, res) => {
    var reviewerId = req.userId
    var reviewerDisplayedName = await User
        .findById(reviewerId, ["displayedName", "-_id"])
        .then(user => {return user.displayedName})
        .catch(err => {
            console.log(err)
            res.status(500).send({ message: err.message })
        })

    var userReview = {
        reviewerId,
        reviewerDisplayedName,
        ...req.body
    }

    var receiver = await User
        .findById(req.body.receiverId)
        .then(user => {return user})
        .catch(err => {
            console.log(err)
            res.status(500).send({ message: err.message })
        })
    
    receiver.userReviews.push(userReview)
    receiver.overallRating = this.getOverallRating(receiver.userReviews)

    receiver.save()
        .then(user => {
            var ret = {
                overallRating: user.overallRating,
                userReviews: user.userReviews
            }
            res.status(200).send(ret)
        }).catch(err => {
            console.log(err)
            res.status(500).send({ message: err.message })
        })
}

exports.getUserReviews = (req, res) => {
    var userId = req.query.userId
    if (!userId) {
        res.status(400).send({ message: "Must specify userId" })
    }
    User.findById(userId, "userReviews").then(user => {
        if (!user) {
            res.status(404).send({ message: "User not found" })
            return
        }
        res.status(200).send(user)
    }).catch(err => {
        console.log(err.message)
        res.status(500).send({ message: err.message })
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

