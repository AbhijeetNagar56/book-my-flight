import Flight from '../models/Flight.js';

export async function filteredFlights (req, res) {
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
}

export async function flightById (req, res) {
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
}



export async function seatAvailability (req, res) {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ success: false, msg: "Flight not found" });
        }

        // Return all seats so frontend can render availability and price information.
        const seats = flight.seats.map((seat) => ({
            _id: seat._id,
            seat_no: seat.seat_no,
            seat_class: seat.seat_class,
            price: seat.price,
            is_booked: seat.is_booked,
            status: seat.is_booked ? 'booked' : 'available'
        }));

        res.status(200).json({ success: true, seats });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
}