import mongoose from "mongoose";

const participantsSchema = new mongoose.Schema({
    userId1: String,
    userId2: String,
    displayedName1: String,
    displayedName2: String
})

const messageSchema = new mongoose.Schema({
    senderId: String,
    content: String,
    timestamp: String
})

const Conversation = mongoose.model(
    'Conversation',
    new mongoose.Schema({
        participants: participantsSchema,
        messages: [
            {
                type: messageSchema
            }
        ]
    })
)

export default Conversation;