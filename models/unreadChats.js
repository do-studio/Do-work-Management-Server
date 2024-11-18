import { model, Schema } from "mongoose";


const UnreadChatSchema = new Schema (
    {
        roomId:{
            type: Schema.Types.ObjectId,
            ref: 'subtasks',
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        unreadCount:{
            type: Number,
            default:0
        }
    }
)

const UnreadChatModel = model('unreadchats', UnreadChatSchema);
export default UnreadChatModel;
