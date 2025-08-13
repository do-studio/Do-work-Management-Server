import mongoose from 'mongoose';
import SubtaskSchedule from '../models/subtaskSchedule.js';
import dayjs from 'dayjs';

// Helper: parse YYYY-MM-DD as UTC midnight
function parseDateAsUTC(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

// -------------------- GET SCHEDULES --------------------
const getSchedulesByMonthYear = async (req, res) => {
    try {
        let { startDate, endDate, clientId } = req.query;
        const query = {};

        if (startDate || endDate) {
            const start = parseDateAsUTC(startDate);
            const end = parseDateAsUTC(endDate);
            end.setUTCHours(23, 59, 59, 999);

            query.date = { $gte: start, $lte: end };
        }

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

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
        }

        if (!Array.isArray(subtasks)) {
            return res.status(400).json({ message: 'Subtasks must be an array' });
        }

        for (const subtaskId of subtasks) {
            if (!mongoose.Types.ObjectId.isValid(subtaskId)) {
                return res.status(400).json({ message: `Invalid subtask ID: ${subtaskId}` });
            }
        }

        const startOfDay = parseDateAsUTC(date);
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCHours(23, 59, 59, 999);

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
                date: startOfDay,
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

        if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Date must be in YYYY-MM-DD format' });
        }

        const startOfDay = parseDateAsUTC(date);
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
