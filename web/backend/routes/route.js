import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Flight from '../models/Flight.js';
import Booking from '../models/Booking.js';
import authMiddleware from '../middlewares/middleware.js';

const router = express.Router();

// ----------------------------------------
// AUTH ROUTES
// ----------------------------------------

// Signup
router.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, mobile, gender, date_of_birth, password } = req.body;
        
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, msg: "User already exists." });
        }

        const password_hash = await bcrypt.hash(password, 10);
        
        const newUser = await User.create({
            username: name,
            email,
            mobile,
            gender,
            date_of_birth,
            password_hash
        });

        res.status(201).json({ success: true, msg: "User created successfully." });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error." });
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, mobile, password } = req.body;
        
        // Find user by email OR mobile
        const user = await User.findOne({
            $or: [{ email: email || '' }, { mobile: mobile || '' }]
        });

        if (!user) {
            return res.status(400).json({ success: false, msg: "User does not exist." });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(400).json({ success: false, msg: "Incorrect password." });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ success: true, msg: "Logged in successfully.", key: token });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error." });
    }
});

// Profile
router.get('/auth/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password_hash');
        
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Internal Server Error." });
    }
});

// ----------------------------------------
// FLIGHT ROUTES
// ----------------------------------------

// Get all flights (filtered by src, dst, date)
router.get('/flights', async (req, res) => {
    try {
        const { src, dst, date } = req.query;

        // Parse date to cover the entire day (00:00:00 to 23:59:59)
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const flights = await Flight.find({
            source_airport: src.toUpperCase(),
            destination_airport: dst.toUpperCase(),
            departure_time: { $gte: startOfDay, $lte: endOfDay }
        }).select('-seats'); // Exclude structural seats schema array for lighter listing metrics

        res.status(200).json({ success: true, flights });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
});

// Get single flight details
router.get('/flights/:id', async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id).select('-seats');
        if (!flight) {
            return res.status(404).json({ success: false, msg: "Flight not found" });
        }
        res.status(200).json({ success: true, flight });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
});

// Get available seats for a specific flight
router.get('/flights/:id/seats', async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ success: false, msg: "Flight not found" });
        }

        // Filter embedded sub-documents array cleanly in JavaScript
        const availableSeats = flight.seats.filter(seat => !seat.is_booked);

        res.status(200).json({ success: true, seats: availableSeats });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
});

// ----------------------------------------
// BOOKING ROUTES
// ----------------------------------------

// Create a booking (Replaces SQL Transactions via native Mongoose Sessions)
router.post('/bookings', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const { flight_id, seat_no } = req.body; // Using seat_no string from the embedded layout

        // Find flight and locate target sub-document seat inside it
        const flight = await Flight.findById(flight_id).session(session);
        if (!flight) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, msg: "Flight not found" });
        }

        const seat = flight.seats.find(s => s.seat_no === seat_no);
        if (!seat) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, msg: "Seat not found" });
        }

        if (seat.is_booked) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, msg: "Seat already booked" });
        }

        // Atomically flag structural seat object as true inside the array
        seat.is_booked = true;
        await flight.save({ session });

        // Generate tracking manifest entry
        const booking = await Booking.create([{
            user_id: userId,
            flight_id,
            seat_no
        }], { session });

        await session.commitTransaction();
        res.status(201).json({ success: true, booking: booking[0] });

    } catch (err) {
        await session.abortTransaction();
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    } finally {
        session.endSession();
    }
});

// Get active profile user reservations
router.get('/bookings/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Populate links references just like a SQL JOIN operation would
        const bookings = await Booking.find({ user_id: userId })
            .populate('flight_id', 'flight_no source_airport destination_airport departure_time')
            .sort({ booking_date: -1 });

        res.status(200).json({ success: true, bookings });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
});

// Delete / Cancel a reservation
router.delete('/bookings/:id', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bookingId = req.params.id;
        const userId = req.user.id;

        const booking = await Booking.findOne({ _id: bookingId, user_id: userId }).session(session);
        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, msg: "Booking not found" });
        }

        // Revert booking status back to unreserved false within matching Flight record
        await Flight.updateOne(
            { _id: booking.flight_id, "seats.seat_no": booking.seat_no },
            { $set: { "seats.$.is_booked": false } }
        ).session(session);

        await booking.deleteOne({ session });

        await session.commitTransaction();
        res.status(200).json({ success: true, msg: "Booking cancelled" });
    } catch (err) {
        await session.abortTransaction();
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    } finally {
        session.endSession();
    }
});

export default router;