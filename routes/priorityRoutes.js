import express from 'express'
import priorityControllers from '../controllers/priorityControllers.js';
import permissionMiddleware from '../middlewares/permissionMiddleware.js';

const priorityRoutes = ()=>{
    const router = express.Router();
    const controllers = priorityControllers()
    
    router.post('/addOption',permissionMiddleware("priority"),controllers.addOption)
    router.get('/getAllPriorities',controllers.getOptions)
    
    return router
}

export default priorityRoutes