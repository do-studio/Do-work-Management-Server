// models/PaymentRecord.js
import { model, mongoose } from 'mongoose';

const billingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['domain', 'server','website'],
        required: true
    },
    link: {
        type: String,
    },
    amount: {
        type: Number,
    },
    createdDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    notes: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true
    }
)



const BillingModel = model('billing', billingSchema);
export default BillingModel;
