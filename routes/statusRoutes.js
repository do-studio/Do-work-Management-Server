import express from 'express'
import statusControllers from '../controllers/statusControllers.js';
import permissionMiddleware from '../middlewares/permissionMiddleware.js';

const statusRoutes = ()=>{
    const router = express.Router();
    const controllers = statusControllers()
    
    router.post('/addOption/:projectId',permissionMiddleware("status"),controllers.addOption)
    router.get('/getAllStatus',controllers.getOptions)
    
    return router
}

export default statusRoutes