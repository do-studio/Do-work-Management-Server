import mongoose, { model } from 'mongoose';

const adClientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'clients', // Must match the model name exactly
            required: true
        },
    },
    {
        timestamps: true
    }
);


const AdClient = model('AdClients', adClientSchema);
export default AdClient;
