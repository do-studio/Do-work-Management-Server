import express from 'express'
import notificationControllers from '../controllers/notificationControllers.js';

const notificationRoutes = ()=>{
    const router = express.Router();
    const controllers = notificationControllers()

    router.get('/getNotifications/:skip',controllers.getNotifications)
    
    return router
}

export default notificationRoutes