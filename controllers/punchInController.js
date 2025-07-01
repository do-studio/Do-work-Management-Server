import PunchInRecord from "../models/punchInRecord.js";
import PunchOutRecord from "../models/punchOutRecord.js";
import mongoose, { Types } from 'mongoose'
import UserModel from "../models/user.js";



const punchInControllers = () => {

    const punchInUser = async (req, res) => {


        try {
            const userId = req.payload.id
            const { latitude, longitude } = req.body;

            const companyLocation = { latitude: process.env.COMPANY_LOCATION_LATITUDE, longitude: process.env.COMPANY_LOCATION_LONGITUDE };

            const today = new Date().toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format

            // Find the latest punch-in record for the user today
            const latestPunchInRecord = await PunchInRecord.findOne({
                userId,
                punchInTime: { $gte: new Date(today + 'T00:00:00.000Z'), $lte: new Date(today + 'T23:59:59.999Z') },
            }).sort({ punchInTime: -1 });


            // If there is already punch-in record, the user cant't punch in
            if (latestPunchInRecord) {

                return res.status(400).json({ error: 'You are already punched in.' });
            }


            const calculateDistance = (lat1, lon1, lat2, lon2) => {
                const R = 6371e3; // Earth's radius in meters
                const φ1 = (lat1 * Math.PI) / 180;
                const φ2 = (lat2 * Math.PI) / 180;
                const Δφ = ((lat2 - lat1) * Math.PI) / 180;
                const Δλ = ((lon2 - lon1) * Math.PI) / 180;

                const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                return R * c; // Distance in meters
            };

            // Calculate the distance between the user's location and the company location
            const distance = calculateDistance(
                latitude,
                longitude,
                companyLocation.latitude,
                companyLocation.longitude
            );

            // Check if the user is within the 30-meter radius
            if (distance <= 100) {
                // Create a new punch-in record with successful status
                const punchInRecord = await PunchInRecord.create({
                    userId,
                    punchInTime: new Date(),
                    punchInLocation: "Office",
                    workingMode: "Onsite",
                    status: 'true',
                    distance,
                });
                res.status(201).json({ message: "Punch in success", punchInRecord });
            } else {
                const punchInRecord = await PunchInRecord.create({
                    userId,
                    punchInTime: new Date(),
                    punchInLocation: `${latitude}, ${longitude}`,
                    workingMode: "WFH",
                    distance,
                    status: 'pending'
                });
                res.status(201).json({ message: "You are not in the office, your request sent to the admin", punchInRecord });
            }
        } catch (error) {
            console.log(error);

            return res.status(500).json({ status: false, message: "Internal error", log: error })
        }

    }

    const checkTodayPunchInStatus = async (req, res) => {
        try {
            const userId = req.payload.id;
            const today = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format

            // Find today's punch-in record for the user
            const todayPunchRecord = await PunchInRecord.findOne({
                userId,
                punchInTime: {
                    $gte: new Date(today + 'T00:00:00.000Z'),
                    $lte: new Date(today + 'T23:59:59.999Z')
                }
            });


            if (!todayPunchRecord) {
                return res.status(200).json({
                    status: true,
                    isPunchedIn: false,
                    message: "No punch-in record found for today"
                });
            }



            // If record exists, format and return the data
            return res.status(200).json({
                status: true,
                isPunchedIn: todayPunchRecord.status,

                message: "User has punched in today",

                punchInDetails: {
                    punchInTime: todayPunchRecord.punchInTime,
                    punchInLocation: todayPunchRecord.punchInLocation,
                    distance: todayPunchRecord.distance,
                    workingMode: todayPunchRecord.workingMode,
                    status: todayPunchRecord.status
                }
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };


    const punchOutUser = async (req, res) => {
        try {
            const userId = req.payload.id;

            const today = new Date().toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format

            // Find the latest punch-in record for the user today
            const latestPunchInRecord = await PunchInRecord.findOne({
                userId,
                punchInTime: { $gte: new Date(today + 'T00:00:00.000Z'), $lte: new Date(today + 'T23:59:59.999Z') },
            }).sort({ punchInTime: -1 });


            // If there's no open punch-in record, the user hasn't punched in yet
            if (!latestPunchInRecord) {
                return res.status(400).json({ error: 'You have not punched in yet.' });
            }


            // Find the latest punch-out record for the user today
            const latestPunchOutRecord = await PunchOutRecord.findOne({
                userId,
                punchOutTime: null,
                punchInTime: { $gte: new Date(today + 'T00:00:00.000Z'), $lte: new Date(today + 'T23:59:59.999Z') },
            }).sort({ punchInTime: -1 });


            // If there is already punched-ou record, the user cant't punch out
            if (latestPunchOutRecord) {
                return res.status(400).json({ error: 'You are already punched out.' });
            }

            // Calculate the distance between the user's current location and the company location
            const { latitude, longitude } = req.body;
            const companyLocation = { latitude: process.env.COMPANY_LOCATION_LATITUDE, longitude: process.env.COMPANY_LOCATION_LONGITUDE };


            const calculateDistance = (lat1, lon1, lat2, lon2) => {
                const R = 6371e3; // Earth's radius in meters
                const φ1 = (lat1 * Math.PI) / 180;
                const φ2 = (lat2 * Math.PI) / 180;
                const Δφ = ((lat2 - lat1) * Math.PI) / 180;
                const Δλ = ((lon2 - lon1) * Math.PI) / 180;

                const a =
                    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                return R * c; // Distance in meters
            };

            const distance = calculateDistance(
                latitude,
                longitude,
                companyLocation.latitude,
                companyLocation.longitude
            );

            // Check if the user is within the 30-meter radius
            if (distance <= 100) {
                // Create a new punch-in record with successful status
                const punchOutRecord = await PunchOutRecord.create({
                    userId,
                    punchOutTime: new Date(),
                    punchOutLocation: `${latitude}, ${longitude}`,
                    workingMode: 'Office',
                    status: "true",
                    distance,
                });
                res.status(201).json({ message: "Punch out success", punchOutRecord });
            } else {
                const punchOutRecord = await PunchOutRecord.create({
                    userId,
                    punchOutTime: new Date(),
                    punchOutLocation: `${latitude}, ${longitude}`,
                    workingMode: 'Office',
                    status: "pending",
                    distance,
                });
                res.status(201).json({ message: "You are not in the office, your request sent to the admin", punchOutRecord });
            }
        } catch (error) {
            console.log(error);

            return res
                .status(500)
                .json({ status: false, message: 'Internal error', log: error });
        }
    };

    const checkTodayPunchOutStatus = async (req, res) => {
        try {
            const userId = req.payload.id;
            const today = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format

            // Find today's punch-in record for the user
            const todayPunchRecord = await PunchOutRecord.findOne({
                userId,
                punchOutTime: {
                    $gte: new Date(today + 'T00:00:00.000Z'),
                    $lte: new Date(today + 'T23:59:59.999Z')
                }
            });

            if (!todayPunchRecord) {
                return res.status(200).json({
                    status: true,
                    isPunchedOut: false,
                    message: "No punch-out record found for today"
                });
            }

            // If record exists, format and return the data
            return res.status(200).json({
                status: true,
                isPunchedOut: todayPunchRecord.status,
                message: "User has punched out today",
                punchOutDetails: {
                    punchOutTime: todayPunchRecord.punchOutTime,
                    punchOutLocation: todayPunchRecord.punchOutLocation,
                    distance: todayPunchRecord.distance,
                    timeElapsed: Math.round((new Date() - new Date(todayPunchRecord.punchOutTime)) / (1000 * 60)) // minutes elapsed since punch-in
                }
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };


    const getTodayAttendance = async (req, res) => {
        try {
            // Get today's date range
            const { date } = req.body
            console.log(date)
            const parsedDate = new Date(date);



            const today = new Date().toISOString().slice(0, 10);


            // const startOfDay = new Date(today + 'T00:00:00.000Z');
            // const endOfDay = new Date(today + 'T23:59:59.999Z');


            // Get all users

            const year = parsedDate.getUTCFullYear();
            const month = String(parsedDate.getUTCMonth()+1).padStart(2, '0'); // Months are 0-based, so add 1
            const day = String(parsedDate.getUTCDate()).padStart(2, '0'); // Pad 



            const startOfDay = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

            // Calculate the end of the day (23:59:59.999)
            const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

            console.log('Start of Day:', startOfDay);
            console.log('End of Day:', endOfDay);


            const users = await UserModel.find({ role: 'roleUser', isActive: true }); // Fetch all users

            // Get all punch-in records for today
            const punchInRecords = await PunchInRecord.find({
                punchInTime: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: "true"
            })
                .populate('userId', 'userName email profilePhotoURL') // Populate user details
                .sort({ punchInTime: -1 });

            // Get all punch-out records for today
            const punchOutRecords = await PunchOutRecord.find({
                punchOutTime: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: "true"
            }).lean();

            // Create a map of punch-out records by userId for easier lookup
            const punchOutMap = new Map(
                punchOutRecords.map(record => [record.userId.toString(), record])
            );

            // Combine users with their punch-in and punch-out records
            const combinedRecords = users.map(user => {
                const punchIn = punchInRecords.find(record => record.userId._id.toString() === user._id.toString());
                const punchOut = punchIn ? punchOutMap.get(punchIn.userId._id.toString()) : null;

                return {
                    userId: user._id,
                    userName: user.userName,
                    profilePhotoURL: user.profilePhotoURL,
                    email: user.email,
                    punchInTime: punchIn ? punchIn.punchInTime : null,
                    punchInLocation: punchIn ? punchIn.punchInLocation : null,
                    distance: punchIn ? punchIn.distance : null,
                    punchOutTime: punchOut ? punchOut.punchOutTime : null,
                    punchOutLocation: punchOut ? punchOut.punchOutLocation : null,
                    workingMode: punchIn ? punchIn.workingMode : null,
                    status: punchIn ? (punchOut ? 'completed' : 'present') : 'absent', // Mark as absent if no punch-in
                    workingHours: punchOut ?
                        ((new Date(punchOut.punchOutTime) - new Date(punchIn.punchInTime)) / (1000 * 60 * 60)).toFixed(2)
                        : null
                };
            });

            // Calculate summary statistics
            const summary = {
                totalRecords: combinedRecords.length,
                activeEmployees: combinedRecords.filter(record => record.status === 'present').length,
                completedShifts: combinedRecords.filter(record => record.status === 'completed').length,
                absentEmployees: combinedRecords.filter(record => record.status === 'absent').length,
                averageWorkingHours: combinedRecords
                    .filter(record => record.workingHours)
                    .reduce((acc, curr) => acc + parseFloat(curr.workingHours), 0) /
                    combinedRecords.filter(record => record.workingHours).length || 0
            };

            res.status(200).json({
                status: true,
                data: {
                    records: combinedRecords,
                    summary
                }
            });

        } catch (error) {
            console.error('Error in getTodayAttendance:', error);
            res.status(500).json({
                status: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };


    const getUserAttendanceReport = async (req, res) => {
        try {
            const userId = req.params.id;
            let { startDate, endDate } = req.body;

            // Parse dates and validate them
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);
            console.log("Start date and end date", startDate, endDate);

            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date range provided'
                });
            }

            console.log(req.body);

            // Get all punch-in records
            const punchInRecords = await PunchInRecord.find({
                status: "true",
                userId: userId,
                punchInTime: {
                    $gte: parsedStartDate,
                    $lte: parsedEndDate
                }
            }).populate('userId', 'userName profilePhotoURL').sort({ punchInTime: 1 });

            // Get all punch-out records for the same period
            const punchOutRecords = await PunchOutRecord.find({
                userId: userId,
                status: "true",
                punchOutTime: {
                    $gte: parsedStartDate,
                    $lte: parsedEndDate
                }
            });

            // Create a map of punch-out records keyed by date
            const punchOutMap = new Map();
            punchOutRecords.forEach(record => {
                const date = new Date(record.punchOutTime).toISOString().slice(0, 10);
                punchOutMap.set(date, record);
            });

            // Get user details from the first punch-in record
            const userDetails = punchInRecords.length > 0 ? {
                userName: punchInRecords[0].userId.userName,
                profilePhotoURL: punchInRecords[0].userId.profilePhotoURL
            } : null;


            // Combine punch-in and punch-out records
            const dailyRecords = punchInRecords.map(punchIn => {
                const punchInDate = new Date(punchIn.punchInTime).toISOString().slice(0, 10);
                const punchOut = punchOutMap.get(punchInDate);
                console.log(punchOut);


                return {
                    date: punchInDate,
                    punchInTime: punchIn.punchInTime,
                    punchOutTime: punchOut?.punchOutTime || null,
                    workingHours: punchOut ?
                        ((new Date(punchOut.punchOutTime) - new Date(punchIn.punchInTime)) / (1000 * 60 * 60)).toFixed(2)
                        : null
                };
            });

            // Calculate working days (excluding weekends)
            const start = new Date(startDate);
            const end = new Date(endDate);
            let workingDays = 0;
            for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip Saturday and Sunday
                    workingDays++;
                }
            }

            // Calculate summary statistics
            const summary = {
                totalDaysPresent: dailyRecords.length,
                totalWorkingDays: workingDays,
                attendancePercentage: ((dailyRecords.length / workingDays) * 100).toFixed(2),
                completedShifts: dailyRecords.filter(record => record.status === 'completed').length,
                averageWorkingHours: dailyRecords
                    .filter(record => record.workingHours)
                    .reduce((acc, curr) => acc + parseFloat(curr.workingHours), 0) /
                    dailyRecords.filter(record => record.workingHours).length || 0
            };

            return res.status(200).json({
                status: true,
                data: {
                    userId,
                    userDetails, // Added user details here
                    period: {
                        startDate,
                        endDate
                    },
                    summary,
                    records: dailyRecords
                }
            });

        } catch (error) {
            console.error('Error in getUserAttendanceReport:', error);
            return res.status(500).json({
                status: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };

    const getAllRequests = async (req, res) => {
        try {
            // Get today's date range
            const today = new Date().toISOString().slice(0, 10);


            // Get all punch-in records for today
            const punchInRecords = await PunchInRecord.find({
                status: 'pending'
            }).populate('userId', 'userName email profilePhotoURL') // Populate user details - adjust fields as needed
                .sort({ punchInTime: -1 });


            // Get all punch-out records for today
            const punchOutRecords = await PunchOutRecord.find({
                status: 'pending'
            }).populate('userId', 'userName email profilePhotoURL') // Populate user details - adjust fields as needed
                .sort({ punchInTime: -1 });





            res.status(200).json({
                status: true,

                data: { punchInRecords, punchOutRecords },

            });

        } catch (error) {
            console.error('Error in getAllRequests:', error);
            res.status(500).json({
                status: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };

    const acceptRequest = async (req, res) => {
        try {
            const { requestId } = req.body;
            if (!requestId) {
                return res.status(400).json({
                    status: false,
                    message: "Request ID is required"
                });
            }

            // Try to find and update in PunchInRecord
            let updatedRecord = await PunchInRecord.findOneAndUpdate(
                { _id: requestId, status: 'pending' },
                { status: 'true' },
                { new: true }
            ).populate('userId', 'userName email profilePhotoURL');

            // If not found in PunchInRecord, try PunchOutRecord
            if (!updatedRecord) {
                updatedRecord = await PunchOutRecord.findOneAndUpdate(
                    { _id: requestId, status: 'pending' },
                    { status: 'true' },
                    { new: true }
                ).populate('userId', 'userName email profilePhotoURL');
            }

            // If not found in either model
            if (!updatedRecord) {
                return res.status(404).json({
                    status: false,
                    message: "Request not found or already approved"
                });
            }

            res.status(200).json({
                status: true,
                message: "Request approved successfully",
                data: updatedRecord
            });

        } catch (error) {
            console.error('Error in acceptRequest:', error);
            res.status(500).json({
                status: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };

    const rejectRequest = async (req, res) => {
        try {
            const { requestId } = req.body;
            if (!requestId) {
                return res.status(400).json({
                    status: false,
                    message: "Request ID is required"
                });
            }

            // Try to find and update in PunchInRecord
            let updatedRecord = await PunchInRecord.findOneAndUpdate(
                { _id: requestId, status: 'pending' },
                { status: 'rejected' },
                { new: true }
            ).populate('userId', 'userName email profilePhotoURL');

            // If not found in PunchInRecord, try PunchOutRecord
            if (!updatedRecord) {
                updatedRecord = await PunchOutRecord.findOneAndUpdate(
                    { _id: requestId, status: 'pending' },
                    { status: 'rejected' },
                    { new: true }
                ).populate('userId', 'userName email profilePhotoURL');
            }

            // If not found in either model
            if (!updatedRecord) {
                return res.status(404).json({
                    status: false,
                    message: "Request not found or already approved"
                });
            }

            res.status(200).json({
                status: true,
                message: "Request rejected",
                data: updatedRecord
            });

        } catch (error) {
            console.error('Error in rejectRequest:', error);
            res.status(500).json({
                status: false,
                message: "Internal server error",
                error: error.message
            });
        }
    };




    return {
        punchInUser,
        punchOutUser,
        checkTodayPunchInStatus,
        checkTodayPunchOutStatus,
        getTodayAttendance,
        getUserAttendanceReport,
        getAllRequests,
        acceptRequest,
        rejectRequest

    }
}

export default punchInControllers;