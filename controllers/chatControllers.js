import Joi from 'joi'
import chatHelpers from '../helpers/chatHelpers.js'
import unreadChatHelpers from '../helpers/unreadChatHelpers.js'
import ChatModel from '../models/chats.js'


const chatControllers = () => {
    const getChatMessages = async (req, res) => {
        try {
            const { roomId, skip } = req.params
            const response = await chatHelpers.getChatMessages(roomId, Number(skip))
            
           

            if (response.length) {
                return res.status(200).json({ status: true, data: response })
            }
            return res.status(200).json({ status: false, message: "No messages found" })
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const sendMessage = async (req, res) => {
        try {
            const messageSchema = Joi.object({
                roomId: Joi.string().required(),
                sender: Joi.string().required(),
                message: Joi.string().min(1).max(2000).required()
            })
            const { error, value } = messageSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const [sendResponse, unreadResponse] = await Promise.allSettled([
                chatHelpers.sendMessage(value),
                unreadChatHelpers.updateChatUnreadCount(value.roomId, value.sender)
            ])

            if (sendResponse.status === "fulfilled" && unreadResponse.status === "fulfilled") {
                return res.status(200).json({ status: true, data: sendResponse.value })
            }
            return res.status(200).json({ status: false, message: "Message could not send" })
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const sendFile = async (req, res) => {
        try {
            const url = req.file.path
            const messageSchema = Joi.object({
                roomId: Joi.string().required(),
                sender: Joi.string().required(),
                type: Joi.string().required()
            })

            const { error, value } = messageSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const [sendResponse, unreadResponse] = await Promise.allSettled([
                chatHelpers.sendMessage({ ...value, message: req.file.originalname, url }),
                unreadChatHelpers.updateChatUnreadCount(value.roomId, value.sender)
            ])

            if (sendResponse.status === "fulfilled" && unreadResponse.status === "fulfilled") {
                return res.status(200).json({ status: true, data: sendResponse.value })
            }
            return res.status(200).json({ status: false, message: "Message could not send" })
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const updateUnreadChat = async (req, res) => {
        try {
            const unreadChatSchema = Joi.object({
                roomId: Joi.string().required(),
                userId: Joi.string().required()
            })
            const { error, value } = unreadChatSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const updateResponse = await unreadChatHelpers.updateUnreadChat(value)
            if (!updateResponse.acknowledged) {
                return res.status(200).json({ status: false, message: "Could not update read status" })
            }
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const removeChat = async (req, res) => {
        try {
            const removeChatSchema = Joi.object({
                chatId: Joi.string().required()
            })
            const { error, value } = removeChatSchema.validate(req.params)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const response = await chatHelpers.removeSingleChat(value.chatId)
            if (response.modifiedCount) {
                return res.status(200).json({ status: true, message: "Chat removed" })
            }
            return res.status(200).json({ status: false, message: "Chat could not remove" })
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }


    return {
        getChatMessages,
        sendMessage,
        sendFile,
        updateUnreadChat,
        removeChat
    }
}

export default chatControllers;