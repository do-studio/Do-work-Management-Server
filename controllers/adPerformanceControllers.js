import mongoose from "mongoose";
import AdClient from "../models/adClients.js";
import adPerformanceModel from "../models/AdPerformance.js";
import dayjs from "dayjs";

const addOrRemoveClient = async (req, res) => {
    try {
        const { clientId, name } = req.body;


        // Validate input
        if (!clientId || !name) {
            return res.status(400).json({ message: 'Client ID and name are required' });
        }

        const adClient = await AdClient.findOne({ clientId });

        if (adClient) {
            // Remove client
            await AdClient.deleteOne({ clientId });
            res.status(200).json({ message: 'Client removed from adClient' });
        } else {
            // Add client
            const client = await AdClient.create({ clientId, name });
            res.status(200).json(client);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


const getClients = async (req, res) => {
    try {

        const adClient = await AdClient.find();

        res.status(200).json(adClient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}



const createOrUpdateAdPerformance = async (req, res) => {
    try {
        const { clientId, date, leadCount, adSpend } = req.body;

        console.log("Received data:", { clientId, date, leadCount, adSpend });

        // Validate input
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid client ID' });
        }

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Invalid date' });
        }

        // Check if client exists
        const adClient = await AdClient.find({ clientId });
        if (!adClient) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Normalize the date to ensure consistency (remove time part)
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        // Check if a record already exists
        const existingPerformance = await adPerformanceModel.findOne({
            clientId,
            date: normalizedDate,
        });

        if (existingPerformance) {
            // Update existing record
            existingPerformance.leadCount = leadCount;
            existingPerformance.adSpend = adSpend;
            await existingPerformance.save();
            return res.status(200).json({ message: 'Ad performance updated', data: existingPerformance });
        } else {
            // Create new record
            const newPerformance = new adPerformanceModel({
                clientId,
                date: normalizedDate,
                leadCount,
                adSpend,
            });
            await newPerformance.save();
            return res.status(201).json({ message: 'Ad performance created', data: newPerformance });
        }
    } catch (err) {
        console.error('Error creating/updating adPerformance:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


const getAdPerformanceByDateRange = async (req, res) => {
    try {
        let { startDate, endDate, clientId } = req.query;

        // Build the base query
        const query = {};

        if (startDate || endDate) {
            startDate = dayjs(startDate).startOf('day').toDate();
            endDate = dayjs(endDate).endOf('day').toDate();
            query.date = { $gte: startDate, $lte: endDate }
        }



        // Add clientId to query if provided
        if (clientId) {
            query.clientId = clientId;
        }

        const adPerformance = await adPerformanceModel.find(query)
            .populate('clientId') // Populate client info


        res.json(adPerformance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const getAdPerformanceByDate = async (req, res) => {
    try {
        let { date, clientId } = req.query;

        // Build the base query
        const query = {};

        if (date) {
            const startDate = dayjs(date).startOf('day').toDate();
            const endDate = dayjs(date).endOf('day').toDate();
            query.date = { $gte: startDate, $lte: endDate };
        }

        // Add clientId to query if provided
        if (clientId) {
            query.clientId = clientId;
        }

        const adPerformance = await adPerformanceModel.find(query)
            .populate('clientId'); // Populate client info

        res.json(adPerformance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}



export default {
    getClients,
    addOrRemoveClient,
    createOrUpdateAdPerformance,
    getAdPerformanceByDateRange,
    getAdPerformanceByDate
}