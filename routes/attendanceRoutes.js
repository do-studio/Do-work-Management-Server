import express from 'express'

import punchInControllers from '../controllers/punchInController.js';


const attendanceRoute = () => {
    const router = express.Router();
    const punchInController = punchInControllers()

    router.post('/punchInUser', punchInController.punchInUser)
    router.post('/checkTodayPunchInStatus', punchInController.checkTodayPunchInStatus)

    router.post('/punchOutUser', punchInController.punchOutUser)
    router.post('/checkTodayPunchOutStatus', punchInController.checkTodayPunchOutStatus)

    router.post('/getTodayAttendance', punchInController.getTodayAttendance)
    router.get('/getAllRequests', punchInController.getAllRequests)

    router.post('/getUserAttendanceReport/:id', punchInController.getUserAttendanceReport)

    router.post('/acceptRequest', punchInController.acceptRequest)
    router.post('/rejectRequest', punchInController.rejectRequest)




    return router
}

export default attendanceRoute