const mongoose = require('mongoose');

const STATUS_OPTIONS = ['Not Started', 'Strategy Done', 'Done', 'Rework', 'Working on it', 'Strategy Approved by Client', 'Approved by Client'];

const assetSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: STATUS_OPTIONS,
        default: 'Not Started'
    },
    dueDate: { type: Date, default: null }
}, { _id: false });

const monthlyTaskSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    monthYear: {
        type: String,
        required: true // Format: "YYYY-MM" (e.g., "2026-06") to easily filter by month
    },
    strategy: { type: assetSchema, default: () => ({}) },
    script: { type: assetSchema, default: () => ({}) },
    motion: { type: assetSchema, default: () => ({}) },
    poster: { type: assetSchema, default: () => ({}) }
}, { timestamps: true });

// Prevent duplicate rows for the same employee, client, and month
monthlyTaskSchema.index({ employeeId: 1, clientId: 1, monthYear: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyTask', monthlyTaskSchema);