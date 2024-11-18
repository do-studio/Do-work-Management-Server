import express from 'express';
import authControllers from '../controllers/authControllers.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const authAdminRoutes = () => {
    const router = express.Router();
    const controllers = authControllers();

    router.post('/signUp',controllers.signUp)
    router.post('/signIn',controllers.signIn)
    router.delete('/signOut',authMiddleware, controllers.signOut);

    return router;
}

export default authAdminRoutes;