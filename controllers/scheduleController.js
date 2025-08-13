import mongoose from 'mongoose';
import SubtaskSchedule from '../models/subtaskSchedule.js';
import dayjs from 'dayjs';
// Corrected import paths for dayjs plugins
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Utility function to normalize dates to UTC at start of day
const normalizeDate = (date) => {
    return dayjs(date).utc().startOf('day').toDate();
};

const getSchedulesByMonthYear = async (req, res) => {
    try {
        let { startDate, endDate, clientId } = req.query;

        // Build the base query
        const query = {};

        if (startDate || endDate) {
            // Normalize dates to UTC start/end of day
            startDate = startDate ? normalizeDate(startDate) : null;
            endDate = endDate ? dayjs(endDate).utc().endOf('day').toDate() : null;

            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
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

        // Check if all subtask IDs are valid
        for (const subtaskId of subtasks) {
            if (!mongoose.Types.ObjectId.isValid(subtaskId)) {
                return res.status(400).json({ message: `Invalid subtask ID: ${subtaskId}` });
            }
        }

        // Normalize the date to UTC start of day
        const normalizedDate = normalizeDate(date);

        // Find existing schedule for this client and date
        const existingSchedule = await SubtaskSchedule.findOne({
            clientId,
            date: normalizedDate
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
                date: normalizedDate,
                subtasks,
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

        console.log("ClientId", clientId);
        console.log("Date", date);

        // Validate input
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        // Normalize the date to UTC start of day
        const normalizedDate = normalizeDate(date);

        // Find and delete the schedule for this client and date
        const result = await SubtaskSchedule.findOneAndDelete({
            clientId,
            date: normalizedDate
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

const getServerTimeInfo = async (req, res) => {
    try {
        const now = new Date();
        const timeInfo = {
            serverTime: now.toString(),
            serverISOString: now.toISOString(),
            serverTimezoneOffset: now.getTimezoneOffset(),
            serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            dayjsVersion: dayjs.version,
            dayjsPlugins: ['utc', 'timezone'], // List of plugins you're using
            sampleDateConversion: {
                inputDate: '2025-08-13',
                rawDate: new Date('2025-08-13').toString(),
                dayjsLocal: dayjs('2025-08-13').format(),
                dayjsUTC: dayjs('2025-08-13').utc().format(),
                normalizedUTC: normalizeDate('2025-08-13').toString()
            }
        };

        res.json(timeInfo);
    } catch (err) {
        console.error('Error getting server time info:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};



export default {
    getSchedulesByMonthYear,
    createOrUpdateSubtaskSchedule,
    removeAllSubtasksForDate,
    getServerTimeInfo
};