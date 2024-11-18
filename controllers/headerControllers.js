import Joi from "joi"
import headerHelpers from "../helpers/headerHelpers.js"
import taskHelpers from "../helpers/taskHelpers.js"
import userHelpers from "../helpers/userHelpers.js"
import notificationHelpers from "../helpers/notificationHelpers.js"
import { addFieldToSchema } from "../models/subTasks.js"


const headerControllers = () => {

    const addHeader = async (req, res) => {
        try {
            const headerSchema = Joi.object({
                name: Joi.string()
                    .min(1)
                    .max(50)
                    .pattern(/^(?!.*  )[A-Za-z]+(?: [A-Za-z]+)*$/)
                    .required()
            })
            const { error, value } = headerSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            value.name = value.name.toLowerCase()
            const assigner = req.payload.id

            const headerExists = await headerHelpers.findHeaderByName(value.name)
            if (headerExists) {
                return res.status(200).json({ status: false, message: "Header already exists" })
            }
            const key = value.name.split(" ").map((word, index) => {
                if (index === 0) {
                    return word
                }
                return word.charAt(0).toUpperCase() + word.slice(1)
            }).join("")

            const schemaUpdation = addFieldToSchema(key)
            if(schemaUpdation){
                const headerCount = await headerHelpers.findHeadersCount()
    
                const headerResponse = await headerHelpers.addHeader({ name: value.name, key, order: headerCount + 1 })
    
                if (headerResponse) {
                    try {
                        const [headerUpdation,userNotificationResponse,notificationResponse] = await Promise.all(
                            [
                                taskHelpers.addHeaderToTask(headerResponse),
                                userHelpers.addNotificationCount(assigner),
                                notificationHelpers.addNotification({assigner,notification:`added new header : ${value.name}`})
                            ]
                        )
                        
                        if (headerUpdation.modifiedCount && notificationResponse) {
                            return res.status(200).json({ status: true, message: "Header added", data: headerResponse,notification:notificationResponse })
                        }
                    } catch (error) {
                        await headerHelpers.removeHeader(headerResponse._id)
                        return res.status(500).json({ status: false, message: "Internal error" })
                    }
                }
            }

            return res.status(200).json({ status: false, message: "Error adding header" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const getAllHeaders = async(req,res)=>{
        try {
            const headerResponse = await headerHelpers.getAllHeaders()
            return res.status(200).json({status:true,data:headerResponse})
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const updateHeaderWidth = async(req,res)=>{
        try {
            const headerUpdateSchema = Joi.object({
                key: Joi.string().min(1).max(200).required(),
                name: Joi.string().min(1).max(200).required(),
                width: Joi.string().min(4).max(6).required()
            })
            const { error, value } = headerUpdateSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const {key,name,width} = value
            const assigner = req.payload.id

            const [headerUpdateResponse,userNotificationResponse,notificationResponse] = await Promise.all(
                [
                    headerHelpers.updateHeaderWidth(key,width),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({assigner,notification:`updated header of ${name}'s width`})
                ]
            )
            
            if(headerUpdateResponse.modifiedCount && notificationResponse){
                return res.status(200).json({status:true, notification: notificationResponse})
            }
            return res.status(200).json({status:false, message: "header updation failed"})
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }


    return {
        addHeader,
        getAllHeaders,
        updateHeaderWidth
    }
}

export default headerControllers;