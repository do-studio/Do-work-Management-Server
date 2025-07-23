import Joi from "joi"
import projectHelpers from "../helpers/projectHelpers.js"
import userHelpers from "../helpers/userHelpers.js"
import notificationHelpers from "../helpers/notificationHelpers.js"
import ProjectModel from "../models/projects.js"


const projectControllers = () => {

    const getAllProjects = async (req, res) => {
        try {
            const projectResponse = await ProjectModel.aggregate([
                {
                    $match: {
                        isActive: true, // Include only active projects
                    },
                },
                {
                    $lookup: {
                        from: "tasks", // Name of the Task collection
                        let: { projectId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$projectId", "$$projectId"] },
                                            { $eq: ["$isActive", true] }, // Include only active tasks
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "tasks",
                    },
                },
                {
                    $lookup: {
                        from: "subtasks", // Name of the Subtask collection
                        let: { taskIds: "$tasks._id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ["$taskId", "$$taskIds"] },
                                            { $eq: ["$isActive", true] }, // Include only active subtasks
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "allSubtasks", // For total subtasks
                    },
                },
                {
                    $lookup: {
                        from: "subtasks", // Name of the Subtask collection
                        let: { taskIds: "$tasks._id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $in: ["$taskId", "$$taskIds"] },
                                            { $eq: ["$isActive", true] }, // Include only active subtasks
                                            { $ne: ["$status", "posted"] }, // Exclude subtasks with status "posted"
                                            { $ne: ["$status", "done"] }, // Exclude subtasks with status "done"
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "pendingSubtasks", // For pending subtasks
                    },
                },
                {
                    $addFields: {
                        totalTaskCount: { $size: "$allSubtasks" }, // Count all subtasks
                        pendingTaskCount: { $size: "$pendingSubtasks" }, // Count pending subtasks
                    },
                },
                {
                    $sort: {
                        createdAt: -1, // Sort projects by createdAt in descending order
                    },
                },
                {
                    $project: {
                        name: 1, // Include the project name
                        createdAt: 1,
                        totalTaskCount: 1, // Include the total task count
                        pendingTaskCount: 1, // Include the pending task count
                    },
                },
            ]);

            return res.status(200).json({
                status: true,
                data: projectResponse.length ? projectResponse : "No projects found",
            });
        } catch (error) {
            throw new Error(`Error getting projects: ${error.message}`);
        }
    }

    const addProject = async (req, res) => {
        try {
            const projectSchema = Joi.object({
                name: Joi.string().min(1).max(50).required()
            })
            const { error, value } = projectSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            value.name = value.name.toLowerCase()
            const projectExists = await projectHelpers.findProjectByName(value.name)
            // if (projectExists) {
            //     return res.status(200).json({ status: false, message: "Project name already exists" })
            // }

            const assigner = req.payload.id
            const [projectResponse, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    projectHelpers.addProject(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `added a project: ${value.name}` })
                ]
            )

            if (projectResponse && notificationResponse) {
                return res.status(200).json({ status: true, data: projectResponse, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error adding project" })
        } catch (error) {
            throw new Error(error.message);
        }
    }


    return {
        getAllProjects,
        addProject
    }
}

export default projectControllers;