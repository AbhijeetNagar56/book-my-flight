import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  flight_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Flight', 
    required: true 
  },
  seat_no: { 
    type: String, 
    required: true 
  },
  booking_date: { type: Date, default: Date.now },
  status: { type: String, default: 'confirmed', enum: ['confirmed', 'cancelled'] }
}, { timestamps: true });

// Enforce that a specific seat on a specific flight can only be booked once
bookingSchema.index({ flight_id: 1, seat_no: 1 }, { unique: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;