import express from 'express'
import scheduleController from '../controllers/scheduleController.js';

const scheduleRoutes = () => {

    const router = express.Router();
    // GET schedules for a given month and year
    router.get('/', scheduleController.getSchedulesByMonthYear);
    // POST create/update schedule for a date
    router.post('/', scheduleController.createOrUpdateSubtaskSchedule);

    router.delete('/', scheduleController.removeAllSubtasksForDate);
    return router;
}


export default scheduleRoutes