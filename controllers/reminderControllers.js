import Month from '../models/reminderMonthModel.js';
import Reminder from '../models/reminderModel.js';


const ReminderControllers = () => {

    const createMonth = async (req, res) => {
        try {
            const { name } = req.body;

            const newMonth = new Month({ name });
            await newMonth.save();

            res.status(201).json({ message: 'Month created successfully!', month: newMonth });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const getAllMonths = async (req, res) => {
        try {
            const months = await Month.find();

            if (months.length === 0) {
                return res.status(404).json({ message: 'No months found.' });
            }

            res.status(200).json(months);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const createReminder = async (req, res) => {
        try {
            const { monthId } = req.params; // Get month by ID
            const { name, date, priority, status } = req.body;

            const month = await Month.findById(monthId);
            if (!month) {
                return res.status(404).json({ message: 'Month not found.' });
            }

            const newReminder = new Reminder({
                name,
                date,
                priority,
                status,
                month: monthId
            });

            await newReminder.save();
            res.status(201).json({ message: 'Reminder created successfully!', reminder: newReminder });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };


    // Get reminders for a specific month
    const getRemindersByMonth = async (req, res) => {
        try {
            const { monthId } = req.params;
            const reminders = await Reminder.find({ month: monthId });

            if (reminders.length === 0) {
                return res.status(404).json({ message: 'No reminders found for this month.' });
            }

            res.status(200).json(reminders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Update a reminder
    const updateReminder = async (req, res) => {
        try {
            const { reminderId } = req.params;
            const { name, date, priority, status } = req.body;

            const updatedReminder = await Reminder.findByIdAndUpdate(
                reminderId,
                { name, date, priority, status },
                { new: true }
            );

            if (!updatedReminder) {
                return res.status(404).json({ message: 'Reminder not found.' });
            }

            res.status(200).json({ message: 'Reminder updated successfully!', reminder: updatedReminder });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };




    // Delete a reminder
    const deleteReminder = async (req, res) => {
        try {
            const { reminderId } = req.params;

            const deletedReminder = await Reminder.findByIdAndDelete(reminderId);

            if (!deletedReminder) {
                return res.status(404).json({ message: 'Reminder not found.' });
            }

            res.status(200).json({ message: 'Reminder deleted successfully!' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    const toggleReminderStatus = async (req, res) => {
        try {
            const { reminderId } = req.params;

            // Find the reminder within the month
            const reminder = await Reminder.findById(reminderId); // Use `findById` with `await`
            if (!reminder) {
                return res.status(404).json({ message: 'Reminder not found' });
            }

            // Toggle the status between "Pending" and "Completed"
            reminder.status = reminder.status === 'pending' ? 'completed' : 'pending';

            // Save the changes
            await reminder.save();

            res.status(200).json({ message: 'Reminder status updated successfully', reminder });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    };




    return {
        createMonth,
        getAllMonths,
        createReminder,
        getRemindersByMonth,
        updateReminder,
        deleteReminder,
        toggleReminderStatus
    }
}

export default ReminderControllers;