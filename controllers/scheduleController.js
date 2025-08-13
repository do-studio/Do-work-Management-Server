import mongoose from 'mongoose';
import SubtaskSchedule from '../models/subtaskSchedule.js';
import dayjs from 'dayjs';

// -------------------- GET SCHEDULES --------------------
const getSchedulesByMonthYear = async (req, res) => {
    try {
        let { startDate, endDate, clientId } = req.query;

        // Build the base query
        const query = {};

        if (startDate || endDate) {
            startDate = dayjs(startDate).startOf('day').toDate();
            endDate = dayjs(endDate).endOf('day').toDate();
            query.date = { $gte: startDate, $lte: endDate };
        }

        // Add clientId to query if provided
        if (clientId) {
            query.clientId = clientId;
        }

        const schedules = await SubtaskSchedule.find(query)
            .populate('clientId')
            .populate({
                path: 'subtasks',
                populate: {
                    path: 'taskId',
                    model: 'tasks',
                    select: 'name description status'
                }
            });

        res.json(schedules);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// -------------------- CREATE / UPDATE --------------------
const createOrUpdateSubtaskSchedule = async (req, res) => {
    try {
        const { clientId, date, subtasks } = req.body;
        console.log(req.body);

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

        for (const subtaskId of subtasks) {
            if (!mongoose.Types.ObjectId.isValid(subtaskId)) {
                return res.status(400).json({ message: `Invalid subtask ID: ${subtaskId}` });
            }
        }

        // Normalize date to start-of-day
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0); // force midnight UTC
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCHours(23, 59, 59, 999);


        // Find existing schedule for this client and date range
        const existingSchedule = await SubtaskSchedule.findOne({
            clientId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        let result;

        if (existingSchedule) {
            existingSchedule.subtasks = subtasks;
            result = await existingSchedule.save();
        } else {
            result = await SubtaskSchedule.create({
                clientId,
                date: startOfDay, // always store normalized date
                subtasks,
            });
        }

        const populatedResult = await SubtaskSchedule.findById(result._id)
            .populate('clientId')
            .populate('subtasks');

        res.status(200).json(populatedResult);
    } catch (err) {
        console.error('Error creating/updating subtask schedule:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// -------------------- REMOVE --------------------
const removeAllSubtasksForDate = async (req, res) => {
    try {
        const { clientId, date } = req.body;

        console.log("ClientId", clientId);
        console.log("Date", date);

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        // Match within the day range
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const result = await SubtaskSchedule.findOneAndDelete({
            clientId,
            date: { $gte: startOfDay, $lte: endOfDay }
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
