import { model, Schema } from "mongoose";
import { getNextSequence } from "../utils/getNextSequence.js";


const SubTaskSchema = new Schema(
    {
        taskId: {
            type: Schema.Types.ObjectId,
            ref: 'tasks',
            required: true
        },
        task: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        status: {
            type: String,
            default: "not started"
        },
        dueDate: {
            type: String
        },
        priority: {
            type: String,
            default: "normal"
        },
        notes: {
            type: String
        },
        people: {
            type: [Schema.Types.ObjectId],
            ref: 'users',
            default: []
        },
        order: {
            type: Number,
            default: 0
        },
        client: {
            type: String
        }
    },
    {
        timestamps: true,
        strict: false
    }
)

SubTaskSchema.pre('save', async function (next) {
    this.order = await getNextSequence("subTaskCounter")
    next();
})

let SubTaskModel = model('subtasks', SubTaskSchema);

export const addFieldToSchema = async (field) => {
    SubTaskSchema.add({ [field]: { type: Schema.Types.Mixed } });
    SubTaskModel = model('subtasks', SubTaskSchema);
    return true
}

export { SubTaskModel }

