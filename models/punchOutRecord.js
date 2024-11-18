import mongoose from 'mongoose';

// PunchInRecord Schema
const PunchOutRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  punchOutTime: {
    type: Date,
    required: true
  },
  punchOutLocation: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
});
const PunchOuRecord = mongoose.model('PunchOutRecord', PunchOutRecordSchema);
export default PunchOuRecord