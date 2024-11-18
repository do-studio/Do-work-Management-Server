import { model, Schema } from "mongoose";
import configKeys from "../config/configKeys.js";


const UserSchema = new Schema (
    {
        userName: {
            type: String,
            unique: true,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        permissions:{
            type: Array,
            default:[]
        },
        isActive:{
            type: Boolean,
            default: false
        },
        role:{
            type: String,
            default: configKeys.JWT_USER_ROLE
        },
        profilePhotoURL:{
            type: String
        },
        notificationUnreadCount:{
            type:Number,
            default:0
        }
    },
    {
        timestamps: true
    }
)


const UserModel = model('users', UserSchema);
export default UserModel;

