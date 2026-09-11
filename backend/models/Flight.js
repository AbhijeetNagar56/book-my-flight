import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  seat_no: { type: String, required: true },
  seat_class: { 
    type: String, 
    required: true, 
    enum: ['economy', 'premium_economy', 'business', 'first_class'] 
  },
  price: { type: Number, required: true },
  is_booked: { type: Boolean, default: false } // Added to easily track seat status dynamically
});

const flightSchema = new mongoose.Schema({
  flight_no: { type: String, required: true },
  source_airport: { type: String, required: true, uppercase: true },
  destination_airport: { type: String, required: true, uppercase: true },
  departure_time: { type: Date, required: true },
  arrival_time: { type: Date, required: true },
  seats: [seatSchema] // Embedded Array of sub-documents
}, { timestamps: true });

// Enforce unique seat numbers per flight
flightSchema.index({ _id: 1, 'seats.seat_no': 1 }, { unique: true });

const Flight = mongoose.model('Flight', flightSchema);
export default Flight;