import express from 'express'
import userControllers from '../controllers/userControllers.js';
import { uploadProfilePic } from '../middlewares/cloudinaryConfig.js';
import upload from '../middlewares/uploadToR2.js';

const userRoutes = () => {
    const router = express.Router();
    const controllers = userControllers()

    router.get('/getUserData', controllers.getUserData)
    router.get('/getSingleUser/:id', controllers.getSingleUser)
    router.get('/getActiveBanner', controllers.getActiveBanner)
    router.patch('/resetNotifications', controllers.resetNotifications)
    router.get('/getUsersAssign', controllers.getUsersAssign)
    router.get('/getPermissions', controllers.getPermissions)
    router.post('/uploadProfilePic', upload.single("profileImgURL"), controllers.uploadProfilePic)

    return router
}

export default userRoutes