import express from 'express';
import { userInfo, bookSeat, bookingHistory, cancelBooking } from '../controllers/userController.js';

const router = express.Router();

// Profile
router.get('/profile', userInfo);
// Create a booking (Replaces SQL Transactions via native Mongoose Sessions)
router.post('/bookings', bookSeat);

// Get active profile user reservations
router.get('/bookings/me', bookingHistory);

// Delete / Cancel a reservation
router.delete('/bookings/:id',cancelBooking);

export default router;
