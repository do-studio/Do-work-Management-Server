import express from 'express'
import taskControllers from '../controllers/taskControllers.js';
import permissionMiddleware from '../middlewares/permissionMiddleware.js';

const taskRoutes = ()=>{
    const router = express.Router();
    const controllers = taskControllers()
    
    router.post('/addTask',controllers.addTask)
    router.get('/getSingleProject/:projectId',controllers.getSingleProject)
    router.get('/getProjectByPeople',controllers.getProjectByPeople)
    router.get('/getProjectByClient',controllers.getProjectByClient)
    router.get('/getSingleProjectIndivitual',controllers.getSingleProjectIndividual)
    router.put('/removeTask/:projectId',permissionMiddleware("remove"),controllers.removeTask)
    router.patch('/dndTasks',controllers.dndTaskUpdate)
    router.patch('/dndHeaders',controllers.dndHeaderUpdate)
    router.patch('/updateName',permissionMiddleware(),controllers.updateTaskName)
    
    return router
}

export default taskRoutes