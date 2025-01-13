import Joi from "joi"
import taskHelpers from "../helpers/taskHelpers.js"
import userHelpers from "../helpers/userHelpers.js"
import subTaskHelpers from "../helpers/subTaskHelpers.js"
import chatHelpers from "../helpers/chatHelpers.js"
import headerHelpers from "../helpers/headerHelpers.js"
import notificationHelpers from "../helpers/notificationHelpers.js"
import UserModel from "../models/user.js"
import configKeys from "../config/configKeys.js"
import ClientModel from "../models/clients.js"


const taskControllers = () => {

    const addTask = async (req, res) => {
        try {
            const taskSchema = Joi.object({
                name: Joi.string().min(1).max(50).required(),
                projectId: Joi.string().required()
            })
            const { error, value } = taskSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            value.name = value.name.toLowerCase()
            const taskExists = await taskHelpers.findTaskByName(value.name, value.projectId)
            if (taskExists) {
                return res.status(200).json({ status: false, message: "Task name already exists" })
            }
            const assigner = req.payload.id

            const allHeaders = await headerHelpers.getHeadersForAddTask()
            if (allHeaders.length) {
                value.headers = allHeaders
            }
            const [taskResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    taskHelpers.addTask(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `added task: ${value.name}` })
                ]
            )

            if (taskResponse && notificationResponse) {
                return res.status(200).json({ status: true, data: taskResponse, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error adding task" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }


    const getSingleProject = async (req, res) => {
        try {

            const { projectId } = req.params
            console.log("Logging from get single project project id is", projectId);
            const { id } = req.payload
            console.log("Requested user id", id);

            const projectResponse = await taskHelpers.getSingleProject(projectId, id)
            if (projectResponse.length) {
                return res.status(200).json({ status: true, data: projectResponse })
            }
            return res.status(200).json({ status: false, message: "No projects found" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const getSingleProjectIndividual = async (req, res) => {
        try {
            const { projectId } = req.params;
            const { id } = req.payload;
            console.log("Requested user id", id);

            const projectResponse = await taskHelpers.getSingleProjectIndividual(projectId, id);

            if (projectResponse.length) {
                return res.status(200).json({ status: true, data: projectResponse });
            }
            return res.status(200).json({ status: false, message: "No tasks found for this user in the project" });
        } catch (error) {
            console.error("Error in getSingleProjectIndividual:", error);
            return res.status(500).json({ status: false, message: "Internal error" });
        }
    };

    const removeTask = async (req, res) => {
        try {
            const taskRemoveSchema = Joi.object({
                taskId: Joi.string().required(),
                taskName: Joi.string().required()
            })

            const { error, value } = taskRemoveSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const assigner = req.payload.id

            const [taskRemove, subTaskRemove, chatRemove, notificationCounter, addNotification] = await Promise.all([
                taskHelpers.removeTask(value.taskId),
                subTaskHelpers.removeAllSubTasks(value.taskId),
                chatHelpers.removeChats(value.taskId),
                userHelpers.addNotificationCount(assigner),
                notificationHelpers.addNotification({ assigner, notification: `removed a task : ${value.taskName}` })
            ])

            if (taskRemove.acknowledged && subTaskRemove.acknowledged && chatRemove.acknowledged && notificationCounter && addNotification) {
                return res.status(200).json({ status: true, message: "Task removed successfully", notification: addNotification })
            }
            return res.status(200).json({ status: false, message: "Error removing Task" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const dndTaskUpdate = async (req, res) => {
        try {
            const dndTaskSchema = Joi.object({
                dragId: Joi.string().required(),
                dropId: Joi.string().required(),
                dragOrder: Joi.number().required(),
                dropOrder: Joi.number().required()
            })

            const { error, value } = dndTaskSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const { dragId, dragOrder, dropId, dropOrder } = value

            const dndTaskResponse = await Promise.all([
                taskHelpers.dndTaskUpdate(dragId, dragOrder),
                taskHelpers.dndTaskUpdate(dropId, dropOrder)
            ])

            const updateStatus = dndTaskResponse.every(response => response.modifiedCount === 1)
            if (updateStatus) {
                return res.status(200).json({ status: true })
            }
            return res.status(200).json({ status: false, message: `Error updating task DnD` })
        } catch (error) {
            console.error('Error in dnd Update:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const dndHeaderUpdate = async (req, res) => {
        try {
            const dndHeaderSchema = Joi.object({
                taskId: Joi.string().required(),
                activeHeaderId: Joi.string().required(),
                activeIndexOrder: Joi.number().required(),
                overHeaderId: Joi.string().required(),
                overIndexOrder: Joi.number().required()
            })
            const { error, value } = dndHeaderSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const { taskId, activeHeaderId, activeIndexOrder, overHeaderId, overIndexOrder } = value

            const dndHeaderResponse = await Promise.all([
                taskHelpers.updateHeaderDnD(taskId, activeHeaderId, overIndexOrder),
                taskHelpers.updateHeaderDnD(taskId, overHeaderId, activeIndexOrder)
            ])

            const updateStatus = dndHeaderResponse.every(response => response.modifiedCount === 1)
            if (updateStatus) {
                return res.status(200).json({ status: true })
            }
            return res.status(200).json({ status: false, message: `Error updating header DnD` })
        } catch (error) {
            console.error('Error in dndHeaderUpdate:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const updateTaskName = async (req, res) => {
        try {
            const taskNameSchema = Joi.object({
                projectId: Joi.string().required(),
                taskId: Joi.string().required(),
                name: Joi.string().max(25).required()
            })
            const { error, value } = taskNameSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            value.name = value.name.toLowerCase()
            const taskExists = await taskHelpers.findTaskByName(value.name, value.projectId)
            if (taskExists && value.taskId !== taskExists._id) {
                return res.status(200).json({ status: false, message: "Task name already exists" })
            }

            const taskNameUpdateResponse = await taskHelpers.updateTaskName(value.taskId, value.name)
            if (taskNameUpdateResponse.modifiedCount) {
                return res.status(200).json({ status: true })
            }
            return res.status(200).json({ status: false, message: "Error updating name" })
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const getProjectByPeople = async (req, res) => {
        try {
            const { id } = req.payload;
            console.log("Requested user id", id);


            // Pass projectId, userId, and today as the due date to the helper function
            const projectResponse = await taskHelpers.getProjectByPeople();
            // return res.status(200).json(projectResponse)



            // return res.status(200).json(projectResponse);
            const people = await UserModel.find({ role: configKeys.JWT_USER_ROLE, isActive: true }, { _id: 1 }).sort({ isActive: 1 });




            // Convert to an array of _id values
            const peopleIds = people.map(person => person._id);






            const result = [];
            const noUserTasks = [];

            for (const personId of peopleIds) {
                const filteredTasks = projectResponse.filter(item => item.people.includes(personId));
                result.push({ personId, tasks: filteredTasks });
            }

            const filteredNoUserTasks = projectResponse.filter(item => item.people.length === 0)

            if (filteredNoUserTasks) {
                noUserTasks.push(filteredNoUserTasks)
            }

            // return res.status(200).json({ status: true, data: "sample" });


            if (projectResponse.length) {
                return res.status(200).json({ status: true, data: { result, filteredNoUserTasks: noUserTasks } });
            }
            return res.status(200).json({ status: false, message: "No tasks found for this user in the project with today's due date" });
        } catch (error) {
            console.error("Error in getSingleProjectIndividual:", error);
            return res.status(500).json({ status: false, message: "Internal error" });
        }
    };
    




    // const getProjectByClient = async (req, res) => {
    //     try {
    //         const { id } = req.payload;
    //         const { projectId } = req.params;
    //         console.log("Requested user id", id);

    //         // Pass projectId, userId, and today as the due date to the helper function
    //         const projectResponse = await taskHelpers.getProjectByPeople(projectId, id)
    //         return res.status(200).json(projectResponse)

    //         const clients = await ClientModel.find();




    //         // Convert to an array of _id values
    //         const clientNames = clients.map(clients => clients.client);



    //         const result = [];

    //         for (const clientName of clientNames) {
    //             const filteredTasks = projectResponse.filter(item =>
    //                 item.subTasks.some(task => task.client === clientName)
    //             );

    //             result.push({
    //                 clientName,
    //                 tasks: filteredTasks.map(task => ({
    //                     ...task,
    //                     subTasks: task.subTasks.filter(subtask => subtask.client === clientName)
    //                 }))
    //             });
    //         }




    //         if (projectResponse.length) {
    //             return res.status(200).json({ status: true, data: result });
    //         }
    //         return res.status(200).json({ status: false, message: "No tasks found for this client in the project " });
    //     } catch (error) {
    //         console.error("Error in getProjectByClient:", error);
    //         return res.status(500).json({ status: false, message: "Internal error" });
    //     }
    // };

    const getProjectByClient = async (req, res) => {
        try {
            const { id } = req.payload;
            const { projectId } = req.params;
            console.log("Requested user id", id);

            // Get project response
            const projectResponse = await taskHelpers.getProjectByClient(projectId, id);
            return res.status(200).json(projectResponse)

            // Get clients and their names
            const clients = await ClientModel.find().sort({ client: 1 });
            const clientNames = clients.map(client => client.client);

            // Initialize result array
            const result = [];

            // Iterate through client names in order
            for (const clientName of clientNames) {
                // Find tasks for this specific client
                const filteredTasks = projectResponse.filter(task =>
                    task.client === clientName ||
                    task.subTasks?.some(subtask => subtask.client === clientName)
                );

                // If there are tasks for this client, add to result
                if (filteredTasks.length > 0) {
                    result.push({
                        clientName,
                        tasks: filteredTasks.map(task => {
                            // Use _doc to get the plain object, or spread the task if _doc doesn't exist
                            const taskData = task._doc || task;

                            // Remove Mongoose-specific metadata
                            const { $__, $isNew, ...cleanTask } = taskData;

                            return {
                                ...cleanTask,
                                // Ensure subtasks are also cleaned
                                subTasks: (cleanTask.subTasks || []).map(subtask => {
                                    const { $__, $isNew, ...cleanSubtask } = subtask._doc || subtask;
                                    return cleanSubtask;
                                })
                            };
                        })
                    });
                }
            }

            // Return response
            if (result.length) {
                return res.status(200).json({ status: true, data: result });
            }

            return res.status(200).json({
                status: false,
                message: "No tasks found for clients in the project"
            });

        } catch (error) {
            console.error("Error in getProjectByClient:", error);
            return res.status(500).json({ status: false, message: "Internal error" });
        }
    };


    return {
        addTask,
        getSingleProject,
        getProjectByPeople,
        removeTask,
        dndTaskUpdate,
        dndHeaderUpdate,
        updateTaskName,
        getProjectByClient,
        getSingleProjectIndividual
    }
}

export default taskControllers;