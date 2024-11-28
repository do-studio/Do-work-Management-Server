import Joi from "joi"
import projectHelpers from "../helpers/projectHelpers.js"
import userHelpers from "../helpers/userHelpers.js"
import notificationHelpers from "../helpers/notificationHelpers.js"


const projectControllers = () => {

    const getAllProjects = async (req, res) => {
        try {
            const projectResponse = await projectHelpers.getAllProjects()
            if (projectResponse.length) {
                return res.status(200).json({ status: true, data: projectResponse })
            }
            return res.status(200).json({ status: false, message: "No projects found" })
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
            if (projectExists) {
                return res.status(200).json({ status: false, message: "Project name already exists" })
            }

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