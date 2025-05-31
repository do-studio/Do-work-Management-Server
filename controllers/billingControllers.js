import BillingModel from "../models/billing.js";


const getBillings = async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (type) query.type = type;

        const [records, total] = await Promise.all([
            BillingModel.find(query)
                .sort({ expiryDate: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            BillingModel.countDocuments(query)
        ]);

        res.json({
            data: records,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const createBilling = async (req, res) => {
    try {
        const { name, type, link, amount, createdDate, expiryDate, notes } = req.body;

        // Check if billing with the same name already exists
        const existingBilling = await BillingModel.findOne({ name });
        if (existingBilling) {
            return res.status(400).json({ message: "Billing already exist" });
        }

        const newRecord = new BillingModel({
            name,
            type,
            link,
            amount,
            createdDate,
            expiryDate,
            notes
        });

        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getBilling = async (req, res) => {
    try {
        const record = await BillingModel.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Payment record not found' });
        }
        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateBilling = async (req, res) => {
    try {
        const { name, type, link, amount, createdDate, expiryDate, notes } = req.body;

        const updatedRecord = await BillingModel.findByIdAndUpdate(
            req.params.id,
            {
                name,
                type,
                link,
                amount,
                createdDate,
                expiryDate,
                notes,
            },
            { new: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: 'Payment record not found' });
        }
        res.json(updatedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteBilling = async (req, res) => {
    try {
        const deletedRecord = await BillingModel.findByIdAndDelete(req.params.id);
        if (!deletedRecord) {
            return res.status(404).json({ message: 'Payment record not found' });
        }
        res.json({ message: 'Payment record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export default {
    getBillings,
    createBilling,
    getBilling,
    updateBilling,
    deleteBilling
}

