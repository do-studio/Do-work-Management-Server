import express from 'express'
import adminControllers from '../controllers/adminControllers.js';
import permissionMiddleware from '../middlewares/permissionMiddleware.js';
import { uploadBanner } from '../middlewares/cloudinaryConfig.js';


const adminRoutes = ()=>{
    const router = express.Router();
    const controllers = adminControllers()

    router.get('/getAllUsers',controllers.getAllUsers)
    router.get('/getHeaders',controllers.getHeaders)
    router.get('/getPermissions',controllers.getPermissions)
    router.post('/addPermission',controllers.addPermission)
    router.patch('/userStatus',controllers.updateUserStatus)
    router.put('/updatePermissions',controllers.updatePermissions)
    router.patch('/updateProjectName',controllers.updateProjectName)
    router.patch('/removeProject',controllers.removeProject)
    router.put('/cloneProject',controllers.cloneProject)

    router.post('/addBanner',uploadBanner,controllers.addBanner)
    router.get('/getBanners',controllers.getBanners)
    router.patch('/applyBanner',controllers.applyBanner)
    router.patch('/removeBanner',controllers.removeBanner)
    
    return router
}

export default adminRoutes