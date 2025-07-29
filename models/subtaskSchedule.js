// MongoDB (Mongoose)
import mongoose from 'mongoose';
const subtaskScheduleSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clients', // ✅ Must match the model name exactly
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subtasks',
  }],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'projects', // Ensure this matches your Project model name
  }
}, {
  timestamps: true
});


const SubtaskScheduleModel = mongoose.model('SubtaskSchedule', subtaskScheduleSchema);
export default SubtaskScheduleModel;

