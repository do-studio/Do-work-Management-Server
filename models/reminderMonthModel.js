import mongoose from 'mongoose';

// Month Schema
const ReminderMonthSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // Name of the month
    },
    { timestamps: true } // Automatic createdAt and updatedAt fields
);

// Export the Month model
const ReminderMonth = mongoose.model('ReminderMonth', ReminderMonthSchema);
export default ReminderMonth;
