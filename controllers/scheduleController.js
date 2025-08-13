import mongoose from 'mongoose';
import SubtaskSchedule from '../models/subtaskSchedule.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Utility function to normalize dates to UTC at start of day
const normalizeDate = (date) => {
  // Parse input as local date, then convert to UTC at start of day
  return dayjs(date).startOf('day').utc().toDate();
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
        console.log('Received date:', date); // Debug log
        
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

        // Debug: Log date conversion steps
        const parsedDate = dayjs(date);
        console.log('Parsed date (local):', parsedDate.format());
        console.log('Parsed date (UTC):', parsedDate.utc().format());

        // Normalize the date to UTC start of day
        const normalizedDate = normalizeDate(date);
        console.log('Normalized UTC date:', normalizedDate, dayjs(normalizedDate).format());

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
        console.log("Original Date", date);

        // Validate input
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        // Normalize the date to UTC start of day
        const normalizedDate = normalizeDate(date);
        console.log("Normalized UTC Date", normalizedDate);

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
        const testDate = '2025-08-13';
        
        const timeInfo = {
            serverTime: now.toString(),
            serverISOString: now.toISOString(),
            serverTimezoneOffset: now.getTimezoneOffset(),
            serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            dayjsVersion: dayjs.version,
            dateHandling: {
                inputDate: testDate,
                dayjsLocal: dayjs(testDate).format(),
                dayjsUTC: dayjs(testDate).utc().format(),
                normalizedDate: normalizeDate(testDate),
                normalizedDateString: normalizeDate(testDate).toString(),
                normalizedDateISO: normalizeDate(testDate).toISOString()
            },
            note: 'All dates should be stored and compared in UTC format'
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