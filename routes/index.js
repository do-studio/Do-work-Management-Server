import authRoutes from './authRoutes.js'
import adminRoutes from './adminRoutes.js'
import userRoutes from './userRoutes.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import subTaskRoutes from './subTaskRoutes.js';
import chatRoutes from './chatRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import headerRoutes from './headerRoutes.js';
import statusRoutes from './statusRoutes.js';
import priorityRoutes from './priorityRoutes.js';
import clientRoutes from './clientRoutes.js';
import attendanceRoute from './attendanceRoute.js';
import reminderRoutes from './reminderRoutes.js'; // Import reminder routes




const routes = (app)=>{
    app.use('/api/auth',authRoutes());
    app.use('/api/admin',authMiddleware,adminRoutes());
    app.use('/api/user',authMiddleware,userRoutes());
    app.use('/api/projects',authMiddleware,projectRoutes());
    app.use('/api/tasks',authMiddleware,taskRoutes());
    app.use('/api/subTasks',authMiddleware,subTaskRoutes());
    app.use('/api/chat',authMiddleware,chatRoutes());
    app.use('/api/notifications',authMiddleware,notificationRoutes());
    app.use('/api/headers',authMiddleware,headerRoutes());
    app.use('/api/status',authMiddleware,statusRoutes());
    app.use('/api/priority',authMiddleware,priorityRoutes());
    app.use('/api/client',authMiddleware,clientRoutes());
    app.use('/api/attendance',authMiddleware,attendanceRoute());
    app.use('/api/reminders', authMiddleware, reminderRoutes()); // Use reminder routes

}

export default routes