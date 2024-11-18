import NotificationModel from "../models/notifications.js";


const notificationHelpers = {
    getNotifications:async(skip=0)=>{
        return await NotificationModel.aggregate(
            [
                {
                  $lookup: {
                    from: "users",
                    localField: "assigner",
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
                    as: "response"
                  }
                },
                {
                  $unwind: {
                    path: "$response"
                  }
                },
                {
                  $project: {
                    assigner: 1,
                    assignerName: "$response.userName",
                    notification: 1,
                    assignerImg: "$response.profilePhotoURL",
                    createdAt: 1
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
                }
              ]
        )
    },
    addNotification:async(data)=>{
        const newNotification = new NotificationModel(data)
        const saved = await newNotification.save()
        const updated = saved.toObject()
        delete updated.__v
        delete updated.updatedAt
        return updated
    }
}

export default notificationHelpers;