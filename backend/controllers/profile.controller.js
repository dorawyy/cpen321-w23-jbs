const { UserType } = require("../constants/user.types")
const db = require("../db")
const jwt = require("jsonwebtoken")
const ratingController = require("./review.controller")

const User = db.user
const EXCLUDED_FIELDS = [
    "-_id",
    "-googleId",
    "-isBanned",
    "-password",
    "-googleOauth",
    "-recommendationWeights"
]

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
    }).catch(err => {
        console.log(err)
        res.status(500).send({ message: err.message })
    })
}

exports.getPrivateProfile = (req, res) => {
    var userId = req.userId
    User.findById(userId).select(EXCLUDED_FIELDS).then(user => {
        if (!user || user.isBanned) {
            res.status(404).send({ message: "User not found."})
        }
        res.status(200).send(user)
    }).catch(err => {
        console.log(err)
        res.status(500).send({ message: err.message })
    })
}

exports.editProfile = (req, res) => {
    var userId = req.userId
    var data = {...req.body}
    User.findByIdAndUpdate(userId, {...data})
        .select(EXCLUDED_FIELDS)
        .then(updatedUser => {
            if (!updatedUser || updatedUser.isBanned) {
                res.status(404).send({ message: "User not found."})
            }
            res.status(200).send(updatedUser)
        }).catch(err => {
            console.log(err)
            res.status(500).send({ message: err.message })
        })
}
