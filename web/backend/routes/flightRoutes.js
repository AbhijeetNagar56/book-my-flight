import express from 'express';
import { filteredFlights, flightById, seatAvailability } from '../controllers/flightController.js';

const router = express.Router();

// Get all flights (filtered by src, dst, date)
router.get('/flights', filteredFlights);

// Get single flight details
router.get('/flights/:id', flightById);

// Get available seats for a specific flight
router.get('/flights/:id/seats', seatAvailability);

export default router;