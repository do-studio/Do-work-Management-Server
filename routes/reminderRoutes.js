import express from 'express';

import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();



import reminderControllers from '../controllers/reminderControllers.js';



const reminderRoute = () => {
    const router = express.Router();
    const reminderController = reminderControllers()

    // Routes for creating and managing months and reminders
    router.post('/months', authMiddleware, reminderController.createMonth); // Create a new month
    router.get('/months', authMiddleware, reminderController.getAllMonths); // Get all months
    router.post('/months/:monthId/reminders', authMiddleware, reminderController.createReminder); // Create a reminder for a specific month
    router.get('/months/:monthId/reminders', authMiddleware, reminderController.getRemindersByMonth); // Get reminders for a specific month
    router.put('/reminders/:reminderId', authMiddleware, reminderController.updateReminder); // Update a specific reminder
    router.delete('/reminders/:reminderId', authMiddleware, reminderController.deleteReminder); // Delete a specific reminder
    router.put('/reminders/:reminderId/toggleStatus', authMiddleware, reminderController.toggleReminderStatus);





    return router
}

export default reminderRoute