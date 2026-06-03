import express from 'express'
import monthlyTaskController from '../controllers/monthlyTaskControllers.js';

const monthlyTaskRoutes = () => {

    const router = express.Router();
    // POST add/remove client
    router.post('/add-task', monthlyTaskController.addMonthlyTask);


    return router;
}


export default monthlyTaskRoutes