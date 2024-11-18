import { model, Schema } from "mongoose";


const NotificationSchema = new Schema(
    {
        assigner:{
            type: Schema.Types.ObjectId,
            ref:"users",
            required:true
        },
        notification: {
            type: String,
            required: true
        }
    },
    {
        timestamps:true

    }
)


const NotificationModel = model('notifications', NotificationSchema);
export default NotificationModel;
