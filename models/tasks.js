import mongoose,{ model, Schema } from "mongoose";
import { getNextSequence } from "../utils/getNextSequence.js";


const TaskSchema = new Schema (
    {
        projectId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'project',
            required: true
        },
        name: {
            type: String,
            // unique: true,
            required: true
        },
        headers:{
            type:Array,
            default:[]
        },
        isActive:{
            type: Boolean,
            default: true
        },
        order:{
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

TaskSchema.pre('save', async function (next) {
    this.order = await getNextSequence()
    next();
})

const TaskModel = model('tasks', TaskSchema);
export default TaskModel;
