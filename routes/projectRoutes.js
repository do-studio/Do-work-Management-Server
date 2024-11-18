import express from 'express'
import projectControllers from '../controllers/projectControllers.js';


const projectRoutes = ()=>{
    const router = express.Router();
    const controllers = projectControllers()
    
    router.get('/getAllProjects',controllers.getAllProjects)
    router.post('/addProject',controllers.addProject)
    
    return router
}

export default projectRoutes