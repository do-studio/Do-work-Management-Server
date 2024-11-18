import { model, Schema } from "mongoose";


const StatusSchema = new Schema(
    {
        option: {
            type: String,
            unique: true,
            required: true
        },
        color: {
            type: String,
            required: true
        }
    }
)


const StatusModel = model('status', StatusSchema);
export default StatusModel;
