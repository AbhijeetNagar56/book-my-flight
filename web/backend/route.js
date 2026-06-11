import express from 'express';
import { pool } from './psql.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import authMiddleware from './middleware.js';

const router = express.Router();
const secret = process.env.JWT_SECRET;
dotenv.config();

// profile config
router.post('/auth/signup', async () => {
    try {
        const { name, email, mobile, gender, date_of_birth, password } = req.body;
        const existing = await pool.query('select * from users where email=$1', [ email ]);

        if(existing.rows.length > 0) {
            return res.status(400).json({ success: false, msg: "User already exist." });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const newUser = await pool.query('insert into users values ($1, $2, $3, $4, $5, $6)',[ name, email, mobile, gender, date_of_birth, password_hash ]);
        const user = newUser.rows[0];

        res.status(201).json({ success: true, msg: "User created successfully."});
    } catch(err) {
        res.status(500).json({ success: false, msg: "Internal Server Error." });
        console.log("Error: ", err.message);
    }
});

router.post('/auth/login', async () => {
    try {
        const { email, mobile, password } = req.body;
        const existing = await pool.query('select * from users where email=$1 or mobile=$2', [ email, mobile ]);

        if(existing.rows.length == 0) {
            return res.status(400).json({ success: false, msg: "User not exist." });
        }

        const user = newUser.rows[0];

        const valid = await bcrypt.compare(password, user.password);

        if(!valid) {
            return res.status(400).json({ success: false , msg: "Incorrect password."});
        }

        const userId = user.id;

        const token = jwt.sign({ userId }, process.env.secret, { expiresIn: "7d" });

        res.status(200).json({ success: true, msg: "User created successfully.", key: token });

    } catch(err) {
        res.status(500).json({ success: false, msg: "Internal Server Error." });
        console.log("Error: ", err.message);
    }
});



router.get(
    '/auth/profile',
    authMiddleware,
    async (req, res) => {

        const userId = req.user.id;

        const user = await pool.query(
            `
            SELECT id,
                   username,
                   email,
                   mobile,
                   gender,
                   date_of_birth
            FROM users
            WHERE id=$1
            `,
            [userId]
        );

        res.status(200).json({
            success: true,
            user: user.rows[0]
        });
    }
);

// get detail of flight and seat availability

router.get('/flights', async (req, res) => {
    try {

        const { src, dst, date } = req.query;

        const flights = await pool.query(
            `
            SELECT *
            FROM flights
            WHERE source_airport = $1
            AND destination_airport = $2
            AND DATE(departure_time) = $3
            `,
            [src, dst, date]
        );

        res.status(200).json({
            success: true,
            flights: flights.rows
        });

    } catch(err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });

    }
});


router.get('/flights/:id', async (req, res) => {
    try {

        const flightId = req.params.id;

        const flight = await pool.query(
            `
            SELECT *
            FROM flights
            WHERE id = $1
            `,
            [flightId]
        );

        if (flight.rows.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "Flight not found"
            });
        }

        res.status(200).json({
            success: true,
            flight: flight.rows[0]
        });

    } catch(err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });

    }
});


router.get('/flights/:id/seats', async (req, res) => {
    try {

        const flightId = req.params.id;

        const seats = await pool.query(
            `
            SELECT s.*
            FROM seats s
            LEFT JOIN bookings b
            ON s.id = b.seat_id
            WHERE s.flight_id = $1
            AND b.id IS NULL
            ORDER BY s.seat_no
            `,
            [flightId]
        );

        res.status(200).json({
            success: true,
            seats: seats.rows
        });

    } catch(err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });

    }
});



router.post('/bookings', authMiddleware, async (req, res) => {

    const client = await pool.connect();

    try {

        const userId = req.user.id;
        const { flight_id, seat_id } = req.body;

        await client.query('BEGIN');

        const seat = await client.query(
            `
            SELECT *
            FROM seats
            WHERE id = $1
            FOR UPDATE
            `,
            [seat_id]
        );

        if (seat.rows.length === 0) {

            await client.query('ROLLBACK');

            return res.status(404).json({
                success: false,
                msg: "Seat not found"
            });
        }

        const existingBooking = await client.query(
            `
            SELECT *
            FROM bookings
            WHERE seat_id = $1
            `,
            [seat_id]
        );

        if (existingBooking.rows.length > 0) {

            await client.query('ROLLBACK');

            return res.status(400).json({
                success: false,
                msg: "Seat already booked"
            });
        }

        const booking = await client.query(
            `
            INSERT INTO bookings
            (
                user_id,
                flight_id,
                seat_id
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            RETURNING *
            `,
            [userId, flight_id, seat_id]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            booking: booking.rows[0]
        });

    } catch(err) {

        await client.query('ROLLBACK');

        console.error(err.message);

        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });

    } finally {

        client.release();

    }
});


router.get('/bookings/me', authMiddleware, async (req, res) => {
    try {

        const userId = req.user.id;

        const bookings = await pool.query(
            `
            SELECT
                b.id,
                b.booking_date,
                b.status,
                f.flight_no,
                f.source_airport,
                f.destination_airport,
                f.departure_time,
                s.seat_no,
                s.seat_class,
                s.price
            FROM bookings b
            JOIN flights f
            ON b.flight_id = f.id
            JOIN seats s
            ON b.seat_id = s.id
            WHERE b.user_id = $1
            ORDER BY b.booking_date DESC
            `,
            [userId]
        );

        res.status(200).json({
            success: true,
            bookings: bookings.rows
        });

    } catch(err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });

    }
});




router.delete('/bookings/:id', authMiddleware, async (req, res) => {
    try {

        const bookingId = req.params.id;
        const userId = req.user.id;

        const booking = await pool.query(
            `
            DELETE FROM bookings
            WHERE id = $1
            AND user_id = $2
            RETURNING *
            `,
            [bookingId, userId]
        );

        if (booking.rows.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            msg: "Booking cancelled"
        });

    } catch(err) {

        console.error(err.message);

        res.status(500).json({
            success: false,
            msg: "Internal Server Error"
        });

    }
});

export default router;