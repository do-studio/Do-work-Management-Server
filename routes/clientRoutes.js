import express from 'express';
import mongoose from 'mongoose';
import clientControllers from '../controllers/clientControllers.js';
import ClientModel from '../models/clients.js';

const clientRoutes = () => {
  const router = express.Router();
  const controllers = clientControllers();

  // Normal client routes
  router.post('/addClient', controllers.addClient);
  router.get('/getAllClients', controllers.getClients);
  router.get('/get-calendar-clients', controllers.getCalendarClients);
  router.put('/calendar-client/:id', controllers.toggleCalendarClient);
  router.delete('/removeClient/:id', controllers.deleteClient);

  return router;
};

export default clientRoutes;
