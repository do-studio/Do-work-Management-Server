import Joi from "joi"
import subTaskHelpers from "../helpers/subTaskHelpers.js"
import chatHelpers from "../helpers/chatHelpers.js"
import headerHelpers from "../helpers/headerHelpers.js"
import userHelpers from "../helpers/userHelpers.js"
import notificationHelpers from "../helpers/notificationHelpers.js"


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
                    notificationHelpers.addNotification({ assigner, notification: `added a subtask: ${value.taskName}` })
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

            const [subTaskNameUpdateResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateSubTaskName(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `updated name of a task` })
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

            const [subTaskNoteUpdateResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateSubTaskNote(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `updated note of a task` })
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

    const updateSubTaskStatus = async(req,res)=>{
        try {
            const subTaskStatusSchema = Joi.object({
                subTaskId: Joi.string().required(),
                status: Joi.string().max(25).required()
            })
            const { error, value } = subTaskStatusSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const assigner = req.payload.id

            const [subTaskStatusUpdateResponse,userNotificationResponse,notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateSubTaskStatus(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({assigner,notification:`updated status of a task`})
                ]
            )
            
            if(subTaskStatusUpdateResponse.modifiedCount && notificationResponse){
                return res.status(200).json({status:true, notification: notificationResponse})
            }
            return res.status(200).json({status:false,message:"Error updating status"})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateSubTaskClient = async (req, res) => {
        try {
            const subTaskStatusSchema = Joi.object({
                subTaskId: Joi.string().required(),
                client: Joi.string().max(25).required()
            })
            const { error, value } = subTaskStatusSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const assigner = req.payload.id

            const [subTaskClientUpdateResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateSubTaskClient(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `updated client of a task` })
                ]
            )

            if (subTaskClientUpdateResponse.modifiedCount && notificationResponse) {
                return res.status(200).json({ status: true, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error updating client" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateSubTaskPriority = async (req, res) => {
        try {
            const subTaskPrioritySchema = Joi.object({
                subTaskId: Joi.string().required(),
                priority: Joi.required()
            })
            const { error, value } = subTaskPrioritySchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const assigner = req.payload.id

            const [subTaskPriorityUpdateResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateSubTaskPriority(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `updated priority of a task` })
                ]
            )

            if (subTaskPriorityUpdateResponse.modifiedCount && notificationResponse) {
                return res.status(200).json({ status: true, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error updating priority" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

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

            const [subTaskDateUpdateResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    subTaskHelpers.updateDueDate(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `updated due date of a task` })
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
                    notificationHelpers.addNotification({ assigner, notification: `updated ${value.field} of a task` })
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