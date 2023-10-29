const db = require("../db")

const User = db.user
const Conversation = db.conversation

exports.getList = async (req, res) => {
    const user = await User.findById(req.userId)
    if (!user)
        return res.status(400).send({ message: "Could not find user in database with provided id" })

    const conversationList = await Conversation.find({
        $or: [
            { 'participants.displayedName1': user.displayedName },
            { 'participants.displayedName2': user.displayedName }
        ]
    })
    return res.status(200).json({
        conversations: conversationList.map(conversation => ({
            conversationId: conversation._id,
            conversationName: conversation.participants.displayedName1 == user.displayedName ? conversation.participants.displayedName2 : conversation.participants.displayedName1
        }))
    })
}

exports.create = async (req, res) => {
    const user = await User.findById(req.userId)
    if (!user)
        return res.status(400).send({ message: "Could not find creating user in database with provided id" })

    const otherUser = await User.findById(req.body.userId)
    if (!otherUser)
        return res.status(400).send({ message: "Could not find other user in database with provided id" })

    const existingConversation = await Conversation.findOne({
        $or: [
            {
                'participants.userId1': req.userId,
                'participants.userId2': req.body.userId
            },
            {
                'participants.userId1': req.body.userId,
                'participants.userId2': req.userId
            }
        ]
    })

    if (existingConversation) {
        return res.status(400).send({ message: "There already exists a conversation between these two users in the database" })
    } else {
        const newConversation = new Conversation({
            participants:
                {
                    userId1: req.userId,
                    userId2: req.body.userId,
                    displayedName1: user.displayedName,
                    displayedName2: otherUser.displayedName
                },
            messages: []
        })
        
        await newConversation.save()

        res.status(200).json({
            conversationId: newConversation._id,
            conversationName: otherUser.displayedName
        })
    }
}