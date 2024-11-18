import UnreadChatModel from "../models/unreadChats.js";
import UserModel from "../models/user.js";


const unreadChatHelpers = {
  updateChatUnreadCount: async (roomId, senderId) => {
    try {
      const allusersExceptSender = await UserModel.find({isActive:true,_id:{$ne:senderId}},{_id:1}).lean()
      const updationArray = allusersExceptSender.map(user=>UnreadChatModel.updateOne({roomId,userId:user._id},
        { $inc: { unreadCount: 1 } },
        { upsert: true }
      ))
      const promiseResponse = await Promise.all(updationArray)
      return promiseResponse.every(each=>each.modifiedCount === 1)
      
    } catch (error) {
      console.error("Error updating unread counts", error);
      throw new Error("Error updating unread counts");
    }
  },
  updateUnreadChat: async (value) => {
    try {
      return await UnreadChatModel.updateOne(value,
        { $set: { unreadCount: 0 } },
        { upsert: true }
      )
    } catch (error) {
      console.error("Error updating unread counts", error);
      throw new Error("Error updating unread counts");
    }
  }
}

export default unreadChatHelpers;