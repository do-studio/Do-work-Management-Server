import express from 'express'

import punchInControllers from '../controllers/punchInController.js';


const attendanceRoute = () => {
    const router = express.Router();
    const punchInController = punchInControllers()

    router.post('/punchInUser', punchInController.punchInUser)
    router.post('/checkTodayPunchInStatus', punchInController.checkTodayPunchInStatus)

    router.post('/punchOutUser', punchInController.punchOutUser)
    router.post('/checkTodayPunchOutStatus', punchInController.checkTodayPunchOutStatus)

    router.get('/getTodayAttendance', punchInController.getTodayAttendance)

    router.post('/getUserAttendanceReport/:id', punchInController.getUserAttendanceReport)





    return router
}

export default attendanceRoute