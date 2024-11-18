import Joi from 'joi'
import userHelpers from '../helpers/userHelpers.js'
import headerHelpers from '../helpers/headerHelpers.js'
import permissionHelpers from '../helpers/permissionHelpers.js'
import projectHelpers from '../helpers/projectHelpers.js'
import taskHelpers from '../helpers/taskHelpers.js'
import chatHelpers from '../helpers/chatHelpers.js'
import subTaskHelpers from '../helpers/subTaskHelpers.js'
import notificationHelpers from '../helpers/notificationHelpers.js'
import bannerHelpers from '../helpers/bannerHelpers.js'


const adminControllers = () => {
    const getAllUsers = async (req, res) => {
        try {
            const getUsersResponse = await userHelpers.getAllUsers()
            return res.status(200).json({ status: true, data: getUsersResponse })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const getHeaders = async (req, res) => {
        try {
            const response = await headerHelpers.getAllHeaders()
            return res.status(200).json({ status: true, data: response })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const getPermissions = async (req, res) => {
        try {
            const response = await permissionHelpers.getPermissions()
            return res.status(200).json({ status: true, data: response })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const addPermission = async (req, res) => {
        try {
            const permissionSchema = Joi.object({
                key: Joi.string().required(),
                name: Joi.string().required()
            })
            const { error, value } = permissionSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const response = await permissionHelpers.addPermission(value)
            return res.status(200).json({ status: true, data: response })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const updateUserStatus = async (req, res) => {
        try {
            const statusSchema = Joi.object({
                id: Joi.string().required(),
                isActive: Joi.boolean().required()
            })
            const { error, value } = statusSchema.validate(req.body)

            if (error) {
                return res.status(500).json({ status: false, message: error.details[0].message })
            }

            const { id, isActive } = value
            const response = await userHelpers.updateUserStatus(id, isActive)
            if (response.modifiedCount) {
                return res.status(200).json({ status: true })
            }
            return res.status(200).json({ status: false, message: "Updation failed" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const updatePermissions = async (req, res) => {
        try {
            const permissionSchema = Joi.object({
                userId: Joi.string().required(),
                permissions: Joi.array().required()
            })
            const { error, value } = permissionSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const { userId, permissions } = value
            const response = await userHelpers.updatePermissions(userId, permissions)
            if (response.modifiedCount) {
                return res.status(200).json({ status: true, message: "Permissions updated" })
            }
            return res.status(200).json({ status: false, message: "Permission updation failed" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const updateProjectName = async (req, res) => {
        try {
            const updateSchema = Joi.object({
                _id: Joi.string().required(),
                name: Joi.string().min(1).max(50).required()
            })
            const { error, value } = updateSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            value.name = value.name.toLowerCase()
            const projectExists = await projectHelpers.findProjectByName(value.name)
            if (projectExists) {
                return res.status(200).json({ status: false, message: "Project name already exists" })
            }
            const assigner = req.payload.id
            const [response, userNotificationResponse, notificationResponse] = await Promise.all(
                [
                    projectHelpers.updateProjectName(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({ assigner, notification: `updated a project's name as : ${value.name}` })
                ]
            )

            if (response.modifiedCount && notificationResponse) {
                return res.status(200).json({ status: true, message: "Project name updated", notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Project name updation failed" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const removeProject = async (req, res) => {
        try {
            const removeSchema = Joi.object({
                projectId: Joi.string().required(),
                name: Joi.string().required()
            })
            const { error, value } = removeSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const assigner = req.payload.id

            const promiseArray = []
            promiseArray.push(projectHelpers.removeProject(value.projectId))
            const taskExists = await taskHelpers.findTasksForRemoval(value.projectId)

            if (taskExists?.length) {
                const tasks = taskExists.map(id => subTaskHelpers.findSubTasksForRemoval(id))

                promiseArray.push(taskHelpers.removeTasks(value.projectId))

                const subTaskExists = await Promise.all(tasks)
                const flattedSubTasks = subTaskExists?.flatMap(id => id)

                if (flattedSubTasks?.length) {
                    taskExists.forEach(taskId => promiseArray.push(subTaskHelpers.removeAllSubTasks(taskId)))
                    flattedSubTasks.forEach(roomId => {
                        promiseArray.push(chatHelpers.removeChats(roomId))
                    })
                }
            }
            promiseArray.push(userHelpers.addNotificationCount(assigner),
                notificationHelpers.addNotification({ assigner, notification: `removed a project: ${value.name}` }))

            const response = await Promise.all(promiseArray)

            const responseStatus = response.every(eachQuery => eachQuery)

            if (!responseStatus) {
                return res.status(200).json({ status: false, message: "Project removal failed" })
            }
            return res.status(200).json({ status: true, message: "Project removed", notification: response[response.length - 1] })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }


    const cloneProject = async (req, res) => {
        try {
            const cloneSchema = Joi.object({
                projectId: Joi.string().required(),
                name: Joi.string().required()
            })
            const { error, value } = cloneSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const assigner = req.payload.id

            const projectCount = await projectHelpers.getAllProjectsByName(value.name)
            const allTasks = await taskHelpers.findAllTaskByProjectId(value.projectId)


            const [clonedProjectResponse, userNotificationResponse, notificationResponse] = await Promise.all([
                projectHelpers.addProject({ name: `${value.name}_clone${projectCount}` }),
                userHelpers.addNotificationCount(assigner),
                notificationHelpers.addNotification({ assigner, notification: `cloned a project: ${value.name}` })
            ])


            if (clonedProjectResponse && notificationResponse) {
                allTasks.forEach(async (task) => await taskHelpers.addTask({ name: `${task.name}_clone${projectCount}`, headers: task.headers, order: task.order, projectId: clonedProjectResponse._id }))

                return res.status(200).json({ status: true, message: "Project cloned", data: clonedProjectResponse, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Project cloning failed" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    // Banner related functions
    const addBanner = async (req, res) => {
        try {
            const response = await bannerHelpers.addBanner({ bannerURL: req.file.path })
            return res.status(200).json({ status: true, data: response })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const getBanners = async (req, res) => {
        try {
            const response = await bannerHelpers.getBanners()
            return res.status(200).json({ status: true, data: response })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const applyBanner = async (req, res) => {
        try {
            const bannerSchema = Joi.object({
                currentBannerId: Joi.string().required(),
                newBannerId: Joi.string().required()
            })
            const { error, value } = bannerSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const [currentBannerResponse, newBannerResponse] = await Promise.all(
                [
                    bannerHelpers.selectBanner(value.currentBannerId, { currentBanner: false }),
                    bannerHelpers.selectBanner(value.newBannerId, { currentBanner: true })
                ]
            )

            if (currentBannerResponse.modifiedCount && newBannerResponse.modifiedCount) {
                return res.status(200).json({ status: true, message: "Banner changed" })
            }

            return res.status(200).json({ status: false, message: "Could not change the banner" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const removeBanner = async (req, res) => {
        try {
            const response = await bannerHelpers.removeBanner(req.body?.bannerId)
            if (response?.modifiedCount) {
                return res.status(200).json({ status: true, message: "Banner removed" })
            }
            return res.status(200).json({ status: false, message: "Could not remove the banner" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    return {
        getAllUsers,
        getHeaders,
        getPermissions,
        addPermission,
        updateUserStatus,
        updatePermissions,
        updateProjectName,
        removeProject,
        cloneProject,
        addBanner,
        getBanners,
        applyBanner,
        removeBanner
    }
}

export default adminControllers;