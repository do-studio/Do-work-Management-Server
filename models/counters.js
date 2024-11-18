import { model, Schema } from "mongoose";

const counterSchema = new Schema (
    {
        _id:{
            type: String,
            default:"taskCounter"
        },
        seq:{
            type: Number,
            required: true,
            default:0
        }
    }
)

const Counters = model('counters', counterSchema);
export default Counters
