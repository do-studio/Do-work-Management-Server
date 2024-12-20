import express from 'express';
import authControllers from '../controllers/authControllers.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const authAdminRoutes = () => {
    const router = express.Router();
    const controllers = authControllers();

    router.post('/signUp', controllers.signUp)
    router.post('/signIn', controllers.signIn)
    router.delete('/signOut', authMiddleware, controllers.signOut);

    // Forget Password
    router.post("/forget-password", controllers.forgotPassword);
    router.post("/forget-password-validate-otp", controllers.validateForgotOTP);

    // Set new password
    router.post("/set-new-password", controllers.newPassword);

    // OTP
    router.post("/send-otp", controllers.sendOTP);
    router.post("/validate-otp", controllers.validateOTP);
    router.post("/resend-otp", controllers.resentOTP);

    return router;
}

export default authAdminRoutes;