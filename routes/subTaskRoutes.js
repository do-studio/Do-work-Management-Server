import subTaskControllers from '../controllers/subTaskControllers.js';
import express from 'express'
import permissionMiddleware from '../middlewares/permissionMiddleware.js';

const subTaskRoutes = () => {
    const router = express.Router();
    const controllers = subTaskControllers()

    router.post('/addSubTask', controllers.addSubTask)
    router.patch('/updateName/:projectId', permissionMiddleware("task"), controllers.updateSubTaskName)
    router.patch('/updateNote/:projectId', permissionMiddleware("notes"), controllers.updateSubTaskNote)
    router.patch('/updateStatus/:projectId', controllers.updateSubTaskStatus)


    router.patch('/updateClient/:projectId', permissionMiddleware("client"), controllers.updateSubTaskClient)


    router.patch('/updatePriority/:projectId', controllers.updateSubTaskPriority)
    router.patch('/updateDueDate/:projectId', controllers.updateDueDate)
    router.patch('/updateField/:projectId', permissionMiddleware("dynamic"), controllers.updateDynamicField)
    router.patch('/assignSubTask/:projectId', permissionMiddleware("people"), controllers.assignSubTask)
    router.patch('/removeSubTask/:projectId', permissionMiddleware("remove"), controllers.removeSubTsk)
    router.patch('/dndSubTasks', controllers.dndSubTaskUpdate)


    router.get('/client', controllers.getClientSubtasks)

    return router
}

export default subTaskRoutes