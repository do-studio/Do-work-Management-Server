import Token from "../models/token.js";


const tokenHelpers = {
    getToken:async(userId)=>{
        return await Token.findOne({userId},{_id:0,userId:1})
    },
    deleteToken:async(userId)=>{
        return await Token.deleteOne({userId})
    },
    // Do not remove {upsert:true,new:true} from addToken query
    addToken:async(userId,token)=>{
        return await Token.findOneAndUpdate({userId},{$set:{token}},{upsert:true,new:true})
    }
}

export default tokenHelpers;