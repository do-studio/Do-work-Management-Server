import mongoose from 'mongoose';

// Reminder Schema
const ReminderSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // Name of the reminder
        date: { type: Date, required: true }, // Reminder date
        priority: { type: String, enum: ['low', 'medium', 'high'], required: true }, // Priority of the reminder
        status: { type: String, enum: ['ending', 'completed','pending'], default: 'pending' }, // Status of the reminder
    },
    { timestamps: true } // Automatic createdAt and updatedAt fields
);

// Export the Reminder model
const Reminder = mongoose.model('Reminder', ReminderSchema);
export default Reminder;
