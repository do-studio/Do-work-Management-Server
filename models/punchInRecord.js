import { mongoose, model } from 'mongoose';

// PunchInRecord Schema
const PunchInRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    punchInTime: {
      type: Date,
      required: true
    },
    punchInLocation: {
      type: String,
      required: true
    },
    distance: {
      type: Number,
      required: true
    },
  });
const PunchInRecord = model('PunchInRecord', PunchInRecordSchema);
export default PunchInRecord