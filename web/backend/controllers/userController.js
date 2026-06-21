import mongoose from 'mongoose';
import User from '../models/User.js';
import Flight from '../models/Flight.js';
import Booking from '../models/Booking.js';

export async function userInfo (req, res) {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password_hash');
        
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Internal Server Error." });
    }
}


export async function bookSeat (req, res) {
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
}


export async function bookingHistory (req, res) {
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
}


export async function cancelBooking (req, res) {
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
}