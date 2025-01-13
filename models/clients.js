import { model, Schema } from "mongoose";


const ClientSchema = new Schema(
    {
        client: {
            type: String,
            unique: true,
            required: true
        },
        color: {
            type: String,
            default: "#05438a",
            required: true,
        }
    }, { timestamps: true }

)


const ClientModel = model('clients', ClientSchema);
export default ClientModel;
