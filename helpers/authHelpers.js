import UserModel from "../models/user.js";
import Token from "../models/token.js";


const authHelpers = {
    signUp:async(userName,email,password)=>{
        const newUser = new UserModel({
            userName,
            email,
            password
        })
        return await newUser.save()
    },
    getUserByEmail:async(email)=>{
        return await UserModel.findOne({email},{__v:0})
    },
    getUserByUserName:async(userName)=>{
        return await UserModel.findOne({userName},{__v:0})
    },
    // Do not remove {upsert:true,new:true} from addToken query
    addToken:async(userId,token)=>{
        return await Token.findOneAndUpdate({userId},{$set:{token}},{upsert:true,new:true})
    }
}

export default authHelpers;