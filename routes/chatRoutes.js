import express from 'express'
import chatControllers from '../controllers/chatControllers.js';
import { uploadChatFile } from '../middlewares/cloudinaryConfig.js';

const chatRoutes = ()=>{
    const router = express.Router();
    const controllers = chatControllers()

    router.get('/getChatMessages/:roomId/:skip',controllers.getChatMessages)
    router.post('/sendMessage',controllers.sendMessage)
    router.post('/sendFile',uploadChatFile,controllers.sendFile)
    router.patch('/updateUnreadChat',controllers.updateUnreadChat)
    router.delete('/removeChat/:chatId',controllers.removeChat)
    
    return router
}

export default chatRoutes