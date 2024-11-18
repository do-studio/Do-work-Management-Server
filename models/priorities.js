import { model, Schema } from "mongoose";


const PrioritySchema = new Schema(
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


const PriorityModel = model('priorities', PrioritySchema);
export default PriorityModel;
