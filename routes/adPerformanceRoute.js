import express from 'express'
import adPerformanceController from '../controllers/adPerformanceControllers.js';

const adPerformanceRoutes = () => {

    const router = express.Router();
    // POST add/remove client
    router.post('/client', adPerformanceController.addOrRemoveClient);

      // POST add/remove client
    router.get('/clients', adPerformanceController.getClients);

    // POST create or update ad performance
    router.post('/performance', adPerformanceController.createOrUpdateAdPerformance);

    // GET get ad performance date range
    router.get('/performance', adPerformanceController.getAdPerformanceByDateRange);

    // GET get ad performance by date
    router.get('/performance-date', adPerformanceController.getAdPerformanceByDate);

    return router;
}


export default adPerformanceRoutes