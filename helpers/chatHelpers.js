import mongoose from "mongoose";
import ChatModel from "../models/chats.js";


const chatHelpers = {
  getChatMessages: async (roomID,skip=0) => {
    const roomId = new mongoose.Types.ObjectId(roomID)
    return await ChatModel.aggregate(
      [
        {
          $match: {
            roomId,
            isActive: true
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 0,
                  userName: 1,
                  profilePhotoURL: 1
                }
              }
            ],
            as: "result"
          }
        },
        {
          $unwind: {
            path: "$result",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            roomId: 1,
            sender: 1,
            type: 1,
            message: 1,
            url: 1,
            createdAt: 1,
            user: "$result.userName",
            profilePhotoURL: "$result.profilePhotoURL"
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $skip: skip
        },
        {
          $limit: 20
        },
        {
          $sort: {
            createdAt: 1
          }
        }
      ]
    )
  },
  sendMessage: async (messageData) => {
    const newMessage = new ChatModel(messageData)
    return await newMessage.save()
  },
  removeSingleChat: async (_id) => {
    return await ChatModel.updateOne({ _id }, { $set: { isActive: false } })
  },
  removeChats: async (roomId) => {
    return await ChatModel.updateMany({ roomId }, { $set: { isActive: false } })
  }
}

export default chatHelpers;