import express from 'express'
import clientControllers from '../controllers/clientControllers.js';

const clientRoutes = () => {
    const router = express.Router();
    const controllers = clientControllers()

    router.post('/addClient', controllers.addClient)
    router.get('/getAllClients', controllers.getClients)
    router.delete('/removeClient/:id',controllers.deleteClient)

    return router
}

export default clientRoutes