import { model, Schema } from "mongoose";
import configKeys from "../config/configKeys.js";


const BannerSchema = new Schema (
    {
        isActive:{
            type: Boolean,
            default: true
        },
        currentBanner:{
            type: Boolean,
            default: false
        },
        bannerURL:{
            type: String,
            required:true
        }
    },
    {
        timestamps: true
    }
)


const BannerModel = model('banners', BannerSchema);
export default BannerModel;

