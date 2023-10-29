const db = require("../db")
const { UserType } = require("../constants/user.types");
const mongoose = require('mongoose')

const User = db.user

exports.ban = async (req, res) => {
    const admin = await User.findById(req.userId)
    if (admin.type != UserType.ADMIN)
        return res.status(401).send({ message: "User is not admin and is not authorized to ban" })

    if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
        return res.status(400).send({ message: "Invalid provided userId" })
    }

    const user = await User.findById(req.body.userId)

    if (user.type == UserType.ADMIN)
        return res.status(401).send({ message: "User is admin and can't be banned" })

    user.isBanned = true
    user.save()
    
    return res.status(200).send({ message: "User with id " + user._id + " was banned successfully" })
}

exports.unban = async (req, res) => {
    const admin = await User.findById(req.userId)
    if (admin.type != UserType.ADMIN)
        return res.status(401).send({ message: "User is not admin and is not authorized to unban" })

    if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
        return res.status(400).send({ message: "Invalid provided userId" })
    }

    const user = await User.findById(req.body.userId)
    user.isBanned = false
    user.save()
    
    return res.status(200).send({ message: "User with id " + user._id + " was unbanned successfully" })
}

exports.getUsers = async (req, res) => {
    const admin = await User.findById(req.userId)
    if (admin.type != UserType.ADMIN)
        res.status(401).send({ message: "User is not admin and is not authorized to view user list" })

    const users = await User.find({})

    return res.status(200).json({
        users: users.map(user => ({
            userId: user._id,
            username: user.username,
            displayedName: user.displayedName,
            type: user.type,
            isBanned: user.isBanned
        })).sort((a, b) => a.displayedName.localeCompare(b.displayedName))
    })
}

exports.getProfile = async (req, res) => {
    const admin = await User.findById(req.userId)
    if (admin.type != UserType.ADMIN)
        res.status(401).send({ message: "User is not admin and is not authorized to view user profile and messages" })

    if (!mongoose.Types.ObjectId.isValid(req.body.userId)) {
        return res.status(400).send({ message: "Invalid provided userId" })
    }
    const user = await User.findById(req.body.userId)

    if (!user) {
        return res.status(400).send({ message: "Could not find user in database with provided id" })
    }

    const userReviews = await User.aggregate([
        { $unwind: '$userReviews' },
        { $match: { 'userReviews.reviewerId': req.body.userId } },
        { $project: { 
            '_id': 0,
            'comment': 'userReviews.comment'
        } }
    ])

    return res.status(200).json({
        bio: user.bio,
        reviews: userReviews
    })

    // TODO: add conversation return in res
}
