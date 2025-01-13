import mongoose from "mongoose";
import TaskModel from "../models/tasks.js";
import { SubTaskModel } from "../models/subTasks.js";

const taskHelpers = {

  getProjectByPeople: async () => {
    const today = new Date();  // Get today's date in local timezone

    // Convert to UTC if you want to compare in UTC
    const startOfDayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 0, 18, 30, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1, 18, 30, 0, 0));
    const oneDayBeforeUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 2, 18, 30, 0, 0));



    const todayTasks = await SubTaskModel.find({
      dueDate: endOfDayUTC.toISOString(),
      isActive: true
    }).sort({ dueDate: 1 });;



    // Query for documents where dueDate is between the start and end of the day

    const tasks = await SubTaskModel.find({
      dueDate: { $gte: startOfDayUTC.toISOString(), $lte: oneDayBeforeUTC.toISOString() },
      status: { $ne: "done" },
      isActive: true
    }).sort({ dueDate: 1 });;


    console.log("end of the day", endOfDayUTC);
    console.log("start of the day", startOfDayUTC);
    console.log("oneDayBeforeUTC", oneDayBeforeUTC);

    const combinedTasks = [...todayTasks, ...tasks];



    return combinedTasks
  },
  getProjectByClient: async () => {
    const today = new Date();
    const startOfDayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 0, 18, 30, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0, 18, 30, 0, 0));

    const pipeline = [
      // Match subtasks within date range and active status
      {
        $match: {
          dueDate: {
            $gte: startOfDayUTC.toISOString(),
            $lte: endOfDayUTC.toISOString()
          },
          status: { $ne: "done" },
          isActive: true
        }
      },
      // Look up the parent task
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'taskDetails'
        }
      },
      // Unwind the taskDetails array
      {
        $unwind: '$taskDetails'
      },
      // Look up chats for each subtask
      {
        $lookup: {
          from: 'chats',
          localField: '_id',
          foreignField: 'roomId',
          pipeline: [
            {
              $match: {
                isActive: true
              }
            },
            // Look up sender details from users collection
            {
              $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'senderDetails'
              }
            },
            {
              $unwind: '$senderDetails'
            },
            // Project only needed fields from sender
            {
              $project: {
                _id: 1,
                message: 1,
                type: 1,
                url: 1,
                createdAt: 1,
                sender: {
                  _id: '$senderDetails._id',
                  name: '$senderDetails.name',
                  email: '$senderDetails.email',
                  profilePhotoURL: '$senderDetails.profilePhotoURL',
                  userName: `$senderDetails.userName`
                }
              }
            }
          ],
          as: 'chats'
        }
      },
      // Look up people details
      {
        $lookup: {
          from: 'users',
          localField: 'people',
          foreignField: '_id',
          as: 'assignedPeople'
        }
      },
      // Group by client
      {
        $group: {
          _id: '$client',
          tasks: {
            $push: {
              _id: '$taskDetails._id',
              name: '$taskDetails.name',
              headers: '$taskDetails.headers',
              order: '$taskDetails.order',
              subTasks: {
                _id: '$_id',
                task: '$task',
                status: '$status',
                dueDate: '$dueDate',
                priority: '$priority',
                notes: '$notes',
                people: '$assignedPeople',
                order: '$order',
                chats: '$chats'
              }
            }
          }
        }
      },
      // Final project to format the output
      {
        $project: {
          clientName: '$_id',
          tasks: {
            $map: {
              input: '$tasks',
              as: 'task',
              in: {
                _id: '$$task._id',
                name: '$$task.name',
                headers: '$$task.headers',
                order: '$$task.order',
                subTasks: {
                  _id: '$$task.subTasks._id',
                  task: '$$task.subTasks.task',
                  status: '$$task.subTasks.status',
                  dueDate: '$$task.subTasks.dueDate',
                  priority: '$$task.subTasks.priority',
                  notes: '$$task.subTasks.notes',
                  people: {
                    $map: {
                      input: '$$task.subTasks.people',
                      as: 'person',
                      in: {
                        _id: '$$person._id',
                        name: '$$person.name',
                        email: '$$person.email'
                      }
                    }
                  },
                  order: '$$task.subTasks.order',
                  chats: '$$task.subTasks.chats'
                }
              }
            }
          }
        }
      },
      // Sort by client name
      {
        $sort: {
          clientName: 1
        }
      }
    ];

    const result = await SubTaskModel.aggregate(pipeline);

    if (result.length) {
      return { status: true, data: result };
    }

    return {
      status: false,
      message: "No tasks found for clients in the project"
    };
  },
  addTask: async (taskData) => {
    const newTask = new TaskModel(taskData)
    return await newTask.save()
  },
  findTaskByName: async (name, projectId) => {
    return await TaskModel.findOne({ isActive: true, name, projectId })
  },
  findAllTaskByProjectId: async (projectId) => {
    return await TaskModel.find({ isActive: true, projectId }, { _id: 0, name: 1, headers: 1, order: 1 }).lean()
  },
  getSingleProject: async (projectid, userid) => {
    const projectId = new mongoose.Types.ObjectId(projectid)
    const userId = new mongoose.Types.ObjectId(userid)
    return await TaskModel.aggregate(
      [
        {
          $match: {
            isActive: true,
            projectId
          }
        },
        {
          $project: {
            isActive: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0
          }
        },
        {
          $lookup: {
            from: "subtasks",
            let: {
              taskId: "$_id"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$taskId", "$$taskId"]
                      },
                      {
                        $eq: ["$isActive", true]
                      }
                    ]
                  }
                }
              },
              {
                $lookup: {
                  from: "users",
                  let: {
                    peopleIds: "$people"
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: ["$_id", "$$peopleIds"]
                        }
                      }
                    },
                    {
                      $project: {
                        userName: 1,
                        profilePhotoURL: 1
                      }
                    }
                  ],
                  as: "people"
                }
              },
              {
                $lookup: {
                  from: "unreadchats",
                  localField: "_id",
                  foreignField: "roomId",
                  pipeline: [
                    {
                      $match: {
                        userId
                      }
                    },
                    {
                      $project: {
                        _id: 0,
                        unreadCount: 1
                      }
                    }
                  ],
                  as: "chatCount"
                }
              },
              {
                $lookup: {
                  from: "chats",
                  localField: "_id",
                  foreignField: "roomId",
                  pipeline: [
                    {
                      $match: {
                        isActive: true
                      }
                    },
                    {
                      $project: {
                        _id: 0,
                        isActive: 1
                      }
                    }
                  ],
                  as: "chats"
                }
              },
              {
                $addFields: {
                  chatUnreadCount: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          "$chatCount.unreadCount",
                          0
                        ]
                      },
                      0
                    ]
                  },
                  isChatExists: {
                    $cond: {
                      if: { $gt: [{ $size: "$chats" }, 0] },
                      then: true,
                      else: false
                    }
                  }
                }
              }
            ],
            as: "subTasks"
          }
        },
        {
          $addFields: {
            subTasks: {
              $let: {
                vars: {
                  filteredSubTasks: {
                    $filter: {
                      input: "$subTasks",
                      as: "subTask",
                      cond: {
                        $ne: ["$$subTask._id", null]
                      }
                    }
                  }
                },
                in: {
                  $sortArray: {
                    input: "$$filteredSubTasks",
                    sortBy: {
                      order: 1
                    }
                  }
                }
              }
            },
            headers: {
              $sortArray: {
                input: "$headers",
                sortBy: {
                  order: 1
                }
              }
            }
          }
        },
        {
          $sort: {
            order: -1
          }
        }
      ]
    )
  },

  getSingleProjectIndividual: async (projectid, userid) => {
    const userId = new mongoose.Types.ObjectId(userid);

    const today = new Date();  // Get today's date in local timezone



    // Convert to UTC if you want to compare in UTC
    const startOfDayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 0, 18, 30, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1, 18, 30, 0, 0));
    const oneDayBeforeUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 2, 18, 30, 0, 0));





    const projects1 = await TaskModel.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $project: {
          isActive: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
      {
        $lookup: {
          from: "subtasks",
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$taskId", "$$taskId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
                // Filter by dueDate range
                // dueDate: endOfDayUTC.toISOString(),
                dueDate: { $gte: startOfDayUTC.toISOString(), $lte: oneDayBeforeUTC.toISOString() },
                status: { $ne: "done" },
              },
            },
            {
              $lookup: {
                from: "users",
                let: { peopleIds: "$people" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$peopleIds"] },
                    },
                  },
                  {
                    $project: {
                      userName: 1,
                      profilePhotoURL: 1,
                    },
                  },
                ],
                as: "people",
              },
            },
            {
              $match: {
                "people._id": userId,
              },
            },
            {
              $lookup: {
                from: "unreadchats",
                localField: "_id",
                foreignField: "roomId",
                pipeline: [
                  {
                    $match: {
                      userId,
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      unreadCount: 1,
                    },
                  },
                ],
                as: "chatCount",
              },
            },
            {
              $lookup: {
                from: "chats",
                localField: "_id",
                foreignField: "roomId",
                pipeline: [
                  {
                    $match: {
                      isActive: true,
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      isActive: 1,
                    },
                  },
                ],
                as: "chats",
              },
            },
            {
              $addFields: {
                chatUnreadCount: {
                  $ifNull: [
                    {
                      $arrayElemAt: ["$chatCount.unreadCount", 0],
                    },
                    0,
                  ],
                },
                isChatExists: {
                  $cond: {
                    if: { $gt: [{ $size: "$chats" }, 0] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
          ],
          as: "subTasks",
        },
      },
      {
        $match: {
          subTasks: { $ne: [] },
        },
      },
      {
        $addFields: {
          subTasks: {
            $let: {
              vars: {
                filteredSubTasks: {
                  $filter: {
                    input: "$subTasks",
                    as: "subTask",
                    cond: { $ne: ["$$subTask._id", null] },
                  },
                },
              },
              in: {
                $sortArray: {
                  input: "$$filteredSubTasks",
                  sortBy: { order: 1 },
                },
              },
            },
          },
          headers: {
            $sortArray: {
              input: "$headers",
              sortBy: { order: 1 },
            },
          },
        },
      },
      {
        $sort: { order: -1 },
      },
    ]);

    const projects2 = await TaskModel.aggregate([
      {
        $match: {
          isActive: true,
        },
      },
      {
        $project: {
          isActive: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
      {
        $lookup: {
          from: "subtasks",
          let: { taskId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$taskId", "$$taskId"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
                // Filter by dueDate range
                dueDate: endOfDayUTC.toISOString(),
                // dueDate: { $gte: startOfDayUTC.toISOString(), $lte: oneDayBeforeUTC.toISOString() },
                // status: { $ne: "done" },
              },
            },
            {
              $lookup: {
                from: "users",
                let: { peopleIds: "$people" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$peopleIds"] },
                    },
                  },
                  {
                    $project: {
                      userName: 1,
                      profilePhotoURL: 1,
                    },
                  },
                ],
                as: "people",
              },
            },
            {
              $match: {
                "people._id": userId,
              },
            },
            {
              $lookup: {
                from: "unreadchats",
                localField: "_id",
                foreignField: "roomId",
                pipeline: [
                  {
                    $match: {
                      userId,
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      unreadCount: 1,
                    },
                  },
                ],
                as: "chatCount",
              },
            },
            {
              $lookup: {
                from: "chats",
                localField: "_id",
                foreignField: "roomId",
                pipeline: [
                  {
                    $match: {
                      isActive: true,
                    },
                  },
                  {
                    $project: {
                      _id: 0,
                      isActive: 1,
                    },
                  },
                ],
                as: "chats",
              },
            },
            {
              $addFields: {
                chatUnreadCount: {
                  $ifNull: [
                    {
                      $arrayElemAt: ["$chatCount.unreadCount", 0],
                    },
                    0,
                  ],
                },
                isChatExists: {
                  $cond: {
                    if: { $gt: [{ $size: "$chats" }, 0] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
          ],
          as: "subTasks",
        },
      },
      {
        $match: {
          subTasks: { $ne: [] },
        },
      },
      {
        $addFields: {
          subTasks: {
            $let: {
              vars: {
                filteredSubTasks: {
                  $filter: {
                    input: "$subTasks",
                    as: "subTask",
                    cond: { $ne: ["$$subTask._id", null] },
                  },
                },
              },
              in: {
                $sortArray: {
                  input: "$$filteredSubTasks",
                  sortBy: { order: 1 },
                },
              },
            },
          },
          headers: {
            $sortArray: {
              input: "$headers",
              sortBy: { order: 1 },
            },
          },
        },
      },
      {
        $sort: { order: -1 },
      },
    ]);

    const combinedResult = [...projects1, ...projects2];

    // Combine tasks with the same name and merge their subtasks
    const mergedResult = combinedResult.reduce((acc, current) => {
      const existingTaskIndex = acc.findIndex(task => task.name === current.name);

      if (existingTaskIndex === -1) {
        // Task with this name doesn't exist, add it
        acc.push(current);
      } else {
        // Task with this name exists, merge subtasks
        const existingTask = acc[existingTaskIndex];

        acc[existingTaskIndex] = {
          ...existingTask,
          subTasks: [
            ...existingTask.subTasks,
            ...current.subTasks,
          ],
        };
      }

      return acc;
    }, []);

    // Optional: Sort subtasks within each task
    mergedResult.forEach(task => {
      task.subTasks.sort((a, b) => a.order - b.order); // Adjust the sort field as needed
    });

    return mergedResult;
  },
  removeTask: async (taskId) => {
    return await TaskModel.updateOne({ _id: taskId }, { $set: { isActive: false } })
  },
  addHeaderToTask: async (headerData) => {
    return await TaskModel.updateMany({ isActive: true }, { $push: { headers: headerData } })
  },
  dndTaskUpdate: async (_id, order) => {
    try {
      return await TaskModel.updateOne({ _id }, { $set: { order } })
    } catch (error) {
      console.error('Error updating task order:', error);
      throw error;
    }
  },
  updateHeaderDnD: async (_id, headerid, order) => {
    try {
      const headerId = new mongoose.Types.ObjectId(headerid)
      return await TaskModel.updateOne({ _id, "headers._id": headerId }, { $set: { "headers.$.order": order } })
    } catch (error) {
      console.error('Error updating header:', error);
      throw error;
    }
  },
  findTasksForRemoval: async (projectId) => {
    const tasks = await TaskModel.find({ projectId }, { _id: 1 }).lean()
    return tasks.map(task => task._id.toString())
  },
  removeTasks: async (projectId) => {
    return await TaskModel.updateMany({ projectId }, { $set: { isActive: false } })
  },
  updateTaskName: async (_id, name) => {
    return await TaskModel.updateOne({ _id }, { $set: { name } })
  }
}

export default taskHelpers;