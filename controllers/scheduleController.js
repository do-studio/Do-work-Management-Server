import mongoose from 'mongoose';
import SubtaskSchedule from '../models/subtaskSchedule.js';
import dayjs from 'dayjs'

const getSchedulesByMonthYear = async (req, res) => {
    try {
        let { startDate, endDate, clientId } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required' });
        }

        startDate = dayjs(startDate).startOf('day').toDate();
        endDate = dayjs(endDate).endOf('day').toDate();

        // Build the base query
        const query = {
            date: { $gte: startDate, $lte: endDate }
        };

        // Add clientId to query if provided
        if (clientId) {
            query.clientId = clientId;
        }

        const schedules = await SubtaskSchedule.find(query)
            .populate('clientId') // Populate client info
            .populate({
                path: 'subtasks',
                populate: {
                    path: 'taskId', // Populate taskId within each subtask
                    model: 'tasks',  // Ensure this matches your Task model name
                    select: 'name description status' // Optional: select specific fields
                }
            });

        res.json(schedules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


const createOrUpdateSubtaskSchedule = async (req, res) => {
    try {
        const { clientId, date, subtasks } = req.body;
        console.log(subtasks)
        console.log("Date",date)

        // Validate input
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        if (!Array.isArray(subtasks)) {
            return res.status(400).json({ message: 'Subtasks must be an array' });
        }

        // Check if all subtask IDs are valid
        for (const subtaskId of subtasks) {
            if (!mongoose.Types.ObjectId.isValid(subtaskId)) {
                return res.status(400).json({ message: `Invalid subtask ID: ${subtaskId}` });
            }
        }

        // Find existing schedule for this client and date
        const existingSchedule = await SubtaskSchedule.findOne({
            clientId,
            date: new Date(date)
        });

        let result;

        if (existingSchedule) {
            // Update existing schedule
            existingSchedule.subtasks = subtasks;
            result = await existingSchedule.save();
        } else {
            // Create new schedule
            result = await SubtaskSchedule.create({
                clientId,
                date: new Date(date),
                subtasks
            });
        }

        // Populate the references for the response
        const populatedResult = await SubtaskSchedule.findById(result._id)
            .populate('clientId')
            .populate('subtasks');

        res.status(200).json(populatedResult);
    } catch (err) {
        console.error('Error creating/updating subtask schedule:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const removeAllSubtasksForDate = async (req, res) => {
    try {
        const { clientId, date } = req.body;

        console.log("ClientId",clientId)
        console.log("Date",date)

        // Validate input
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        // Find and delete the schedule for this client and date
        const result = await SubtaskSchedule.findOneAndDelete({
            clientId,
            date: dayjs(date).startOf('day').toDate()
        });

        if (!result) {
            return res.status(404).json({
                message: 'Nothing to delete',
                success: false
            });
        }

        res.status(200).json({
            message: 'All subtasks removed successfully for this date',
            success: true,
            deletedSchedule: result
        });

    } catch (err) {
        console.error('Error removing subtasks:', err);
        res.status(500).json({
            message: 'Server error',
            error: err.message,
            success: false
        });
    }
};


export default {
    getSchedulesByMonthYear,
    createOrUpdateSubtaskSchedule,
    removeAllSubtasksForDate
};