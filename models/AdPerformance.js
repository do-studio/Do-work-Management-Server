// MongoDB (Mongoose)
import mongoose from 'mongoose';
const adPerformanceSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients', // ✅ Must match the model name exactly
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    leadCount: {
        type: Number,
        required: true
    },
    adSpend: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});


const adPerformanceModel = mongoose.model('adPerformance', adPerformanceSchema);
export default adPerformanceModel;

