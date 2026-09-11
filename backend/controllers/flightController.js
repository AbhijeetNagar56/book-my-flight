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

        const seatClasses = ['economy', 'premium_economy', 'business', 'first_class'];
        const seats = seatClasses.map((seat_class) => {
            const classSeats = flight.seats.filter((seat) => seat.seat_class === seat_class);
            const availableSeats = classSeats.filter((seat) => !seat.is_booked);
            return {
                seat_class,
                price: classSeats[0]?.price ?? 0,
                available_count: availableSeats.length,
                status: availableSeats.length > 0 ? 'available' : 'sold_out'
            };
        });

        res.status(200).json({ success: true, seats });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
}