const db = require("../db")
const { UserType } = require("../constants/user.types");

const User = db.user

exports.ban = async (req, res) => {
    const admin = await User.findById(req.userId)
    if (admin.type != UserType.ADMIN)
        return res.status(401).send({ message: "User is not admin and is not authorized to ban" })

    const user = await User.findById(req.body.userId)
    user.isBanned = true
    user.save()
    
    return res.status(200).send({ message: "User with id " + user._id + " was banned successfully" })
}

exports.unban = async (req, res) => {
    const admin = await User.findById(req.userId)
    if (admin.type != UserType.ADMIN)
        return res.status(401).send({ message: "User is not admin and is not authorized to unban" })

    const user = await User.findById(req.body.userId)
    user.isBanned = false
    user.save()
    
    return res.status(200).send({ message: "User with id " + user._id + " was unbanned successfully" })
}

// exports.getUsers = async (req, res) => {
//     const admin = await User.findById(req.userId)
//     if (admin.type != UserType.ADMIN)
//         res.status(401).send({ message: "User is not admin and is not authorized to view user list" })

//     const users = await User.find({})
// }