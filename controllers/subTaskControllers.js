import Joi from "joi"
import subTaskHelpers from "../helpers/subTaskHelpers.js"
import chatHelpers from "../helpers/chatHelpers.js"
import headerHelpers from "../helpers/headerHelpers.js"
import userHelpers from "../helpers/userHelpers.js"
import notificationHelpers from "../helpers/notificationHelpers.js"
import { SubTaskModel } from "../models/subTasks.js"
import TaskModel from "../models/tasks.js"
import ChatModel from "../models/chats.js"


const subTaskControllers = () => {

    const addSubTask = async (req, res) => {
        try {
            const subTaskSchema = Joi.object({
                taskId: Joi.string().required(),
                taskName: Joi.string().required()
            })
            const { error, value } = subTaskSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const { taskId, taskName } = value

            const subTaskNameExists = await subTaskHelpers.findSubTaskByName(taskName)
            if (subTaskNameExists) {
                return res.status(200).json({ status: false, message: "Sub-task name already exists" })
            }
            const assigner = req.payload.id



            const allHeaders = await headerHelpers.getAllHeaders()
            const subTask = { taskId }
            if (allHeaders.length) {
                allHeaders?.forEach(header => {
                    if (header.key === "task") {
                        subTask.task = taskName
                    } else if (header.key === "status") {
                        subTask.status = "not started"
                    } else if (header.key === "priority") {
                        subTask.priority = "normal"
                    } else if (header.key === "people") {
                        subTask.people = []
                    } else {
                        subTask[header.key] = ""
                    }
                })
            }
            const [subTaskResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.addSubTask(subTask),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `The task ${value.taskName} has been added.` })
                ]
            )

            if (subTaskResponse && notificationResponse) {
                return res.status(200).json({ status: true, data: subTaskResponse, notification: notificationResponse })
            }

            return res.status(200).json({ status: false, message: "Error adding Sub-task" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateSubTaskName = async (req, res) => {
        try {
            const subTaskNameSchema = Joi.object({
                subTaskId: Joi.string().required(),
                name: Joi.string().min(1).required()
            })
            const { error, value } = subTaskNameSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const assigner = req.payload.id
            const subTask = await SubTaskModel.findById(value.subTaskId);

            if (!subTask) {
                return res.status(200).json({ status: false, message: "Subtask not found" });
            }

            const subTaskName = subTask.task; // Assuming the subtask has a `name` field

            const [subTaskNameUpdateResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateSubTaskName(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `The name of the task ${subTaskName} has been changed to ${value.name}` })
                ]
            )

            if (subTaskNameUpdateResponse.modifiedCount && notificationResponse) {
                return res.status(200).json({ status: true, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error updating name" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateSubTaskNote = async (req, res) => {
        try {
            const subTaskNoteSchema = Joi.object({
                subTaskId: Joi.string().required(),
                notes: Joi.string().allow("").max(150).required()
            })
            const { error, value } = subTaskNoteSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const assigner = req.payload.id

            const subTask = await SubTaskModel.findById(value.subTaskId);

            if (!subTask) {
                return res.status(200).json({ status: false, message: "Subtask not found" });
            }

            const subTaskName = subTask.task; // Assuming the subtask has a `name` field

            const [subTaskNoteUpdateResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateSubTaskNote(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `The note for the task ${subTaskName} has been updated.` })
                ]
            )

            if (subTaskNoteUpdateResponse.modifiedCount && notificationResponse) {
                return res.status(200).json({ status: true, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error updating note" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateSubTaskStatus = async (req, res) => {
        try {
            const subTaskStatusSchema = Joi.object({
                subTaskId: Joi.string().required(),
                status: Joi.string().max(25).required()
            });

            const { error, value } = subTaskStatusSchema.validate(req.body);

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message });
            }

            const assigner = req.payload.id;

            // Fetch the subtask to get its name and previous status
            const subTask = await SubTaskModel.findById(value.subTaskId);

            if (!subTask) {
                return res.status(200).json({ status: false, message: "Subtask not found" });
            }


            const taskId = subTask.taskId; // Get the taskId from the subtask

            // Fetch the task to get the projectId
            const task = await TaskModel.findById(taskId);

            if (!task) {
                return res.status(200).json({ status: false, message: "Parent task not found" });
            }

            const previousStatus = subTask.status;
            const subTaskName = subTask.task; // Assuming `task` holds the subtask name

            // Update the status
            const subTaskStatusUpdateResponse = await subTaskHelpers.updateSubTaskStatus(value);


            if (!subTaskStatusUpdateResponse.modifiedCount) {
                return res.status(200).json({ status: false, message: "Error updating status" });
            }

            // Create a notification
            const [userNotificationResponse, notificationResponse] = await Promise.all([
                userHelpers.addNotificationCount(assigner),
                notificationHelpers.addNotification({
                    assigner,
                    notification: `The status of the ${subTaskName} has been changed from ${previousStatus} to ${value.status}.`
                })
            ]);

            // Store the update in the chat
            await ChatModel.create({
                roomId: value.subTaskId,
                sender: assigner,
                message: `Status changed.`,
                typeOfChat: "status_update",
                from: previousStatus,
                to: value.status,
                createdAt: new Date()
            });


            const subTaskNew = await SubTaskModel.findById(value.subTaskId);


            // Emit a socket event to update all connected clients
            req.app.get("socketio").emit("subtaskUpdated", {
                subtask: subTaskNew
            });
            console.log('Emitting subTaskStatusUpdated event:', value.subTaskId, value.status); // Debug log



            return res.status(200).json({
                status: true, notification: notificationResponse, projectId: task.projectId // Include the projectId in the response
            });
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    };


    const updateSubTaskClient = async (req, res) => {
        try {
            const subTaskStatusSchema = Joi.object({
                subTaskId: Joi.string().required(),
                client: Joi.string().max(25).required()
            });

            const { error, value } = subTaskStatusSchema.validate(req.body);

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message });
            }

            const assigner = req.payload.id;

            // Fetch the subtask
            const subTask = await SubTaskModel.findById(value.subTaskId);

            if (!subTask) {
                return res.status(200).json({ status: false, message: "Subtask not found" });
            }

            const subTaskName = subTask.task; // Assuming the subtask has a `task` field
            const previousClient = subTask.client || "Not Assigned"; // Handle case where there is no previous client

            // Perform updates concurrently
            const [subTaskClientUpdateResponse, userNotificationResponse, notificationResponse, chatResponse] = await Promise.all([
                subTaskHelpers.updateSubTaskClient(value),
                userHelpers.addNotificationCount(assigner),
                notificationHelpers.addNotification({
                    assigner,
                    notification: `The client for the task "${subTaskName}" has been changed from ${previousClient} to ${value.client}.`
                }),
                ChatModel.create({
                    roomId: value.subTaskId,
                    sender: assigner,
                    message: `Client updated.`,
                    typeOfChat: "client_update",
                    from: previousClient !== "Not Assigned" ? previousClient : null,
                    to: value.client,
                    createdAt: new Date()
                })
            ]);

            if (subTaskClientUpdateResponse.modifiedCount && notificationResponse && chatResponse) {
                return res.status(200).json({ status: true, notification: notificationResponse, chat: chatResponse });
            }

            return res.status(200).json({ status: false, message: "Error updating client" });

        } catch (error) {
            console.error("Error updating subtask client:", error);
            return res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    };


    // const updateSubTaskPriority = async (req, res) => {
    //     try {
    //         const subTaskPrioritySchema = Joi.object({
    //             subTaskId: Joi.string().required(),
    //             priority: Joi.required()
    //         });

    //         const { error, value } = subTaskPrioritySchema.validate(req.body);

    //         if (error) {
    //             return res.status(200).json({ status: false, message: error.details[0].message });
    //         }

    //         const assigner = req.payload.id;

    //         // Fetch the subtask
    //         const subTask = await SubTaskModel.findById(value.subTaskId);

    //         if (!subTask) {
    //             return res.status(200).json({ status: false, message: "Subtask not found" });
    //         }

    //         const subTaskName = subTask.task; // Assuming the subtask has a `task` field
    //         const previousPriority = subTask.priority; // Get the previous priority before updating

    //         // Perform updates concurrently
    //         const [subTaskPriorityUpdateResponse, userNotificationResponse, notificationResponse, chatResponse] = await Promise.all([
    //             subTaskHelpers.updateSubTaskPriority(value),
    //             userHelpers.addNotificationCount(assigner),
    //             notificationHelpers.addNotification({
    //                 assigner,
    //                 notification: `The priority of the task "${subTaskName}" has been updated from ${previousPriority} to ${value.priority}.`
    //             }),
    //             ChatModel.create({
    //                 roomId: value.subTaskId,
    //                 sender: assigner,
    //                 message: `Priority updated.`,
    //                 typeOfChat: "priority_update",
    //                 from: previousPriority,
    //                 to: value.priority,
    //                 createdAt: new Date()
    //             })
    //         ]);

    //         if (subTaskPriorityUpdateResponse.modifiedCount && notificationResponse && chatResponse) {
    //             return res.status(200).json({ status: true, notification: notificationResponse, chat: chatResponse });
    //         }

    //         return res.status(200).json({ status: false, message: "Error updating priority" });

    //     } catch (error) {
    //         console.error("Error updating subtask priority:", error);
    //         return res.status(500).json({ status: false, message: "Internal Server Error" });
    //     }
    // };




    const updateSubTaskPriority = async (req, res) => {
        try {

            const subTaskPrioritySchema = Joi.object({
                subTaskId: Joi.string().required(),
                priority: Joi.required()
            });

            const { error, value } = subTaskPrioritySchema.validate(req.body);

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message });
            }

            const assigner = req.payload.id;

            // Fetch the subtask
            const subTask = await SubTaskModel.findById(value.subTaskId);

            if (!subTask) {
                return res.status(200).json({ status: false, message: "Subtask not found" });
            }

            const subTaskName = subTask.task; // Assuming the subtask has a `task` field
            const previousPriority = subTask.priority; // Get the previous priority before updating
            const taskId = subTask.taskId; // Get the taskId from the subtask

            // Fetch the task to get the projectId
            const task = await TaskModel.findById(taskId);

            if (!task) {
                return res.status(200).json({ status: false, message: "Parent task not found" });
            }

            // const projectId = task.projectId; // Get the projectId from the task

            // Perform updates concurrently
            const [subTaskPriorityUpdateResponse, userNotificationResponse, notificationResponse, chatResponse] = await Promise.all([
                subTaskHelpers.updateSubTaskPriority(value),
                userHelpers.addNotificationCount(assigner),
                notificationHelpers.addNotification({
                    assigner,
                    notification: `The priority of the task "${subTaskName}" has been updated from ${previousPriority} to ${value.priority}.`
                }),
                ChatModel.create({
                    roomId: value.subTaskId,
                    sender: assigner,
                    message: `Priority updated.`,
                    typeOfChat: "priority_update",
                    from: previousPriority,
                    to: value.priority,
                    createdAt: new Date()
                })
            ]);

            if (subTaskPriorityUpdateResponse.modifiedCount && notificationResponse && chatResponse) {
                return res.status(200).json({
                    status: true,
                    notification: notificationResponse,
                    chat: chatResponse,
                    projectId: task.projectId // Include the projectId in the response
                });
            }

            return res.status(200).json({ status: false, message: "Error updating priority" });

        } catch (error) {
            console.error("Error updating subtask priority:", error);
            return res.status(500).json({ status: false, message: "Internal Server Error" });
        }
    };



    const updateDueDate = async (req, res) => {
        try {
            const dueDateSchema = Joi.object({
                subTaskId: Joi.string().required(),
                dueDate: Joi.string().allow(null).required()
            })
            const { error, value } = dueDateSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const assigner = req.payload.id

            const subTask = await SubTaskModel.findById(value.subTaskId);

            if (!subTask) {
                return res.status(200).json({ status: false, message: "Subtask not found" });
            }

            const subTaskName = subTask.task; // Assuming the subtask has a `name` field


            const formatDueDate = (isoDate) => {
                return new Date(isoDate).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                });
            };

            const [subTaskDateUpdateResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateDueDate(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `The due date for the task ${subTaskName} has been updated to ${formatDueDate(value.dueDate)}.` })
                ]
            )

            if (subTaskDateUpdateResponse.modifiedCount && notificationResponse) {
                return res.status(200).json({ status: true, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error updating due date" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateDynamicField = async (req, res) => {
        try {
            const dynamicFieldSchema = Joi.object({
                subTaskId: Joi.string().required(),
                field: Joi.string().max(25).required(),
                value: Joi.string().max(25).required()
            })
            const { error, value } = dynamicFieldSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const assigner = req.payload.id

            const [dynamicFieldUpdateResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateDynamicField(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `updated ${value.field} of a task to ${value.value}` })
                ]
            )

            if (dynamicFieldUpdateResponse.modifiedCount && notificationResponse) {
                return res.status(200).json({ status: true, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error updating value" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const assignSubTask = async (req, res) => {
        try {
            const subTaskAssignSchema = Joi.object({
                subTaskId: Joi.string().required(),
                peopleId: Joi.string().required(),
                assignee: Joi.string().required(),
                isAdded: Joi.boolean().required()
            })
            const { error, value } = subTaskAssignSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const { subTaskId, peopleId, assignee, isAdded } = value
            const assigner = req.payload.id
            const [assignResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updatePeople(subTaskId, peopleId, isAdded),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `${isAdded ? "assigned task to" : "removed task from"} ${assignee}` })
                ]
            )

            if (assignResponse.modifiedCount && notificationResponse) {
                return res.status(200).json({ status: true, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error assigning person" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const removeSubTsk = async (req, res) => {
        try {
            const removeSubTaskSchema = Joi.array().items(Joi.string().required()).min(1)
            const { error, value } = removeSubTaskSchema.validate(req.body.subTaskIds)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const assigner = req.payload.id
            const queryArray = []
            value.forEach(id => {
                queryArray.push(subTaskHelpers.removeSubTask(id))
                queryArray.push(chatHelpers.removeChats(id))
            })

            queryArray.push(userHelpers.addNotificationCount(assigner), notificationHelpers.addNotification({ assigner, notification: `removed a subtask` }))

            const subTaskRemoveResponse = await Promise.all(queryArray)
            const removeStatus = subTaskRemoveResponse.every(response => response)
            if (removeStatus) {
                return res.status(200).json({ status: true, message: `${value.length > 1 ? "Sub tasks" : "Sub task"} removed`, notification: subTaskRemoveResponse[subTaskRemoveResponse.length - 1] })
            }
            return res.status(200).json({ status: false, message: `Error removing ${value.length > 1 ? "sub tasks" : "sub task"}` })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const dndSubTaskUpdate = async (req, res) => {
        try {
            const dndSubTaskSchema = Joi.object({
                dragSubTaskId: Joi.string().required(),
                dropSubTaskId: Joi.string().required(),
                dragOrder: Joi.number().required(),
                dropOrder: Joi.number().required()
            })

            const { error, value } = dndSubTaskSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const { dragSubTaskId, dragOrder, dropSubTaskId, dropOrder } = value

            const dndTaskResponse = await Promise.all([
                subTaskHelpers.dndSubTaskUpdate(dragSubTaskId, dragOrder),
                subTaskHelpers.dndSubTaskUpdate(dropSubTaskId, dropOrder)
            ])

            const updateStatus = dndTaskResponse.every(response => response.modifiedCount === 1)
            if (updateStatus) {
                return res.status(200).json({ status: true })
            }
            return res.status(200).json({ status: false, message: `Error updating subtask DnD` })
        } catch (error) {
            console.error('Error in dnd Update:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }


    return {
        addSubTask,
        updateSubTaskName,
        updateSubTaskNote,
        updateSubTaskStatus,
        updateSubTaskClient,
        updateSubTaskPriority,
        updateDueDate,
        updateDynamicField,
        assignSubTask,
        removeSubTsk,
        dndSubTaskUpdate
    }
}

export default subTaskControllers;