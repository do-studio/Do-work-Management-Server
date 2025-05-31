import mongoose, { model, Schema } from "mongoose";


const ChatSchema = new Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subtasks',
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        message: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        typeOfChat: {
            type: String
        },
        type: {
            type: String
        },
        from: {
            type: String
        },
        to: {
            type: String
        },
        url: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const ChatModel = model('chats', ChatSchema);
export default ChatModel;


