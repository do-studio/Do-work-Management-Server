import express from 'express';
import taskController from '../controllers/task.controller.js';

const taskRoutesNew = () => {
  const router = express.Router();

  // GET aggregated monthly dashboard
  router.get('/monthly-dashboard', taskController.getMonthlyDashboard);

  // POST save or update monthly task tracking row
  router.post('/save', taskController.saveMonthlyTask);

  // DELETE monthly task tracking row
  router.delete('/delete', taskController.deleteMonthlyTask);

  return router;
};

export default taskRoutesNew;
