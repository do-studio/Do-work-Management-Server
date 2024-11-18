import { model, Schema } from "mongoose";


const PermissionSchema = new Schema(
    {
        key: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
            unique: true,
            required: true
        }
    }
)


const PermissionModel = model('permissions', PermissionSchema);
export default PermissionModel;
