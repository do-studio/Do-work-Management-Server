import mongoose from 'mongoose';
import SubtaskSchedule from '../models/subtaskSchedule.js';

// Utility function to handle dates consistently
const normalizeDate = (dateString) => {
  // Handle both date-only (YYYY-MM-DD) and full ISO strings
  const dateOnly = dateString.split('T')[0];
  const [year, month, day] = dateOnly.split('-');
  
  // Create as UTC date at midnight (more reliable than string parsing)
  return new Date(Date.UTC(year, month - 1, day));
};

const validateDateInput = (date) => {
  if (!date) return false;
  
  // Check for YYYY-MM-DD format or valid ISO string
  const dateRegex = /^\d{4}-\d{2}-\d{2}/;
  if (!dateRegex.test(date)) return false;
  
  const d = new Date(date);
  return !isNaN(d.getTime());
};

const getSchedulesByMonthYear = async (req, res) => {
    try {
        let { startDate, endDate, clientId } = req.query;

        // Build the base query
        const query = {};

        if (startDate || endDate) {
            // Validate dates first
            if (startDate && !validateDateInput(startDate)) {
                return res.status(400).json({ message: 'Invalid startDate format' });
            }
            if (endDate && !validateDateInput(endDate)) {
                return res.status(400).json({ message: 'Invalid endDate format' });
            }

            // Normalize dates
            startDate = startDate ? normalizeDate(startDate) : null;
            endDate = endDate ? new Date(normalizeDate(endDate).setUTCHours(23, 59, 59, 999)) : null;
            
            query.date = { 
                ...(startDate && { $gte: startDate }),
                ...(endDate && { $lte: endDate })
            };
        }

        if (clientId) {
            if (!mongoose.Types.ObjectId.isValid(clientId)) {
                return res.status(400).json({ message: 'Invalid client ID' });
            }
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
        console.error('Error in getSchedules:', err);
        res.status(500).json({ 
            message: 'Server error',
            error: err.message 
        });
    }
};

const createOrUpdateSubtaskSchedule = async (req, res) => {
    try {
        const { clientId, date, subtasks } = req.body;
        console.log('Raw input:', { clientId, date, subtasks });

        // Validate input
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        if (!validateDateInput(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        if (!Array.isArray(subtasks)) {
            return res.status(400).json({ message: 'Subtasks must be an array' });
        }

        // Validate subtask IDs
        const invalidSubtaskIds = subtasks.filter(
            id => !mongoose.Types.ObjectId.isValid(id)
        );
        if (invalidSubtaskIds.length > 0) {
            return res.status(400).json({ 
                message: 'Invalid subtask IDs',
                invalidIds: invalidSubtaskIds
            });
        }

        // Normalize and store date
        const normalizedDate = normalizeDate(date);
        console.log('Normalized date stored in DB:', normalizedDate.toISOString());

        const result = await SubtaskSchedule.findOneAndUpdate(
            { clientId, date: normalizedDate },
            { subtasks },
            { 
                new: true, 
                upsert: true,
                setDefaultsOnInsert: true 
            }
        )
        .populate('clientId')
        .populate('subtasks');

        res.status(200).json(result);
    } catch (err) {
        console.error('Error in createOrUpdate:', err);
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message 
        });
    }
};

const removeAllSubtasksForDate = async (req, res) => {
    try {
        const { clientId, date } = req.body;
        console.log('Delete request:', { clientId, date });

        // Validate input
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        if (!validateDateInput(date)) {
            return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        const normalizedDate = normalizeDate(date);
        const result = await SubtaskSchedule.findOneAndDelete({
            clientId,
            date: normalizedDate
        });

        if (!result) {
            return res.status(404).json({
                message: 'No schedule found for this date',
                success: false
            });
        }

        res.status(200).json({
            message: 'Subtasks removed successfully',
            success: true,
            deletedSchedule: result
        });

    } catch (err) {
        console.error('Error in removeAllSubtasks:', err);
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