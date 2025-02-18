import express from 'express';
const router = express.Router();
import { getMonths, createMonth, deleteMonth } from '../controllers/reminderMonthControllers.js';

router.get('/', getMonths);
router.post('/', createMonth);
router.delete('/:id', deleteMonth);

export default router; // ✅ Ensure you export default
