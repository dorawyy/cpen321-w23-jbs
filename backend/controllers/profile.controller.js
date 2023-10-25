const { UserType } = require("../constants/user.types")
const db = require("../db")
const jwt = require("jsonwebtoken")
const ratingController = require("./rating.controller")

const User = db.user

exports.getPublicProfile = (req, res) => {
    var userId = req.query.userId
    if (!userId) {
        res.status(400).send({ message: "Must specify userId."})
    }

    User.findById(userId).then(user => {
        if (!user || user.isBanned) {
            res.status(404).send({ message: "User not found."})
        }
        
        var ratings = user.userReviews
        ratings.sort((fb1, fb2) => fb2.rating - fb1.rating)
        var top2Ratings
        if (ratings.length <= 2) {
            top2Ratings = ratings
        } else {
            top2Ratings = ratings.slice(0, 3)
        }

        var data = {
            displayedName: user.displayedName,
            overallRating: ratingController.getOverallRating(ratings),
            bio: user.bio,
            school: user.school,
            program: user.program,
            courses: user.education.courses,
            tags: user.education.tags,
            top2Ratings
        }
        res.status(200).send(data)
        
    })
}

exports.getPrivateProfile = (req, res) => {
    var userId = req.userId
    User.findById(userId).select([
        "-googleId",
        "-isBanned",
        "-password",
        "-googleOauth",
        "-recommendationWeights",
    ]).then(user => {
        if (!user || user.isBanned) {
            res.status(404).send({ message: "User not found."})
        }
        res.status(200).send(user)

    })
}

