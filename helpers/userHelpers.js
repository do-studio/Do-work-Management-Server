import configKeys from "../config/configKeys.js";
import UserModel from "../models/user.js";


const userHelpers = {
    getUserData:async(_id)=>{
        return await UserModel.findOne({_id},{password:0,isActive:0})
    },
    addNotificationCount:async(assigner)=>{
        return await UserModel.updateMany({_id:{$ne:assigner}},{$inc:{notificationUnreadCount:1}})
    },
    resetNotifications:async(_id)=>{
        return await UserModel.updateOne({_id},{$set:{notificationUnreadCount:0}})
    },
    getAllUsers:async()=>{
        return await UserModel.find({role:configKeys.JWT_USER_ROLE},{__v:0,password:0,role:0}).sort({isActive:1})
    },
    getUsersForAssign:async()=>{
        return await UserModel.find({isActive:true},{userName:1,profilePhotoURL:1})
    },
    updateUserStatus:async(_id,isActive)=>{
        return await UserModel.updateOne({_id},{$set:{isActive}})
    },
    updatePermissions:async(_id,permissions)=>{
        return await UserModel.updateOne({_id},{$set:{permissions}})
    },
    getUserPermissions:async(_id)=>{
        return await UserModel.findOne({_id},{permissions:1})
    },
    uploadProfilePic:async(_id,profilePhotoURL)=>{
        return await UserModel.updateOne({_id},{$set:{profilePhotoURL}})
    }
}

export default userHelpers;