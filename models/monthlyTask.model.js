import mongoose, { model, Schema } from "mongoose";

const STATUS_OPTIONS = [
  'Not Started',
  'Strategy Done',
  'Rework',
  'Working on it',
  'Strategy Approved by Client'
];

const assetSchema = new Schema({
  status: {
    type: String,
    enum: STATUS_OPTIONS,
    default: 'Not Started'
  },
  dueDate: {
    type: Date,
    default: null
  }
}, { _id: false });

const monthlyTaskSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'clients',
    required: true
  },
  assignedTo: {
    type: [Schema.Types.ObjectId],
    ref: 'users',
    default: []
  },
  monthYear: {
    type: String,
    required: true // Format: "YYYY-MM" (e.g., "2026-06") to easily query by month
  },
  strategy: { type: assetSchema, default: () => ({}) },
  script: { type: assetSchema, default: () => ({}) },
  motion: { type: assetSchema, default: () => ({}) },
  poster: { type: assetSchema, default: () => ({}) }
}, { timestamps: true });

// Prevent duplicate entries for the same client under the same employee in a single month
monthlyTaskSchema.index({ employeeId: 1, clientId: 1, monthYear: 1 }, { unique: true });

const MonthlyTaskModel = mongoose.models.MonthlyTask || model('MonthlyTask', monthlyTaskSchema);

export default MonthlyTaskModel;
