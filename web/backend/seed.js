import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Flight from './models/Flight.js';
import Booking from './models/Booking.js';

dotenv.config();

// Reusable Seat Matrix Generator
const generateSeats = () => {
  const seats = [];
  // Create 12 dummy seats per flight (Rows 1 to 3, Seats A to D)
  for (let row = 1; row <= 3; row++) {
    for (let col of ['A', 'B', 'C', 'D']) {
      let seatClass = 'economy';
      let price = 5000;

      if (row === 1) {
        seatClass = 'first_class';
        price = 25000;
      } else if (row === 2) {
        seatClass = 'business';
        price = 15000;
      }

      seats.push({
        seat_no: `${row}${col}`,
        seat_class: seatClass,
        price: price,
        is_booked: false
      });
    }
  }
  return seats;
};

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for bulk seeding...');

    // 2. Clear out any existing data to start fresh
    await User.deleteMany({});
    await Flight.deleteMany({});
    await Booking.deleteMany({});
    console.log('Existing collections cleared.');

    // 3. Create exactly 5 Dummy Users
    console.log('Inserting 5 distinct test users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const userDocs = [];
    for (let i = 1; i <= 5; i++) {
      userDocs.push({
        username: `testuser_${i}`,
        email: `user${i}@example.com`,
        mobile: `987654320${i}`,
        gender: i % 2 === 0 ? 'female' : 'male',
        date_of_birth: new Date(`199${i}-05-15`),
        password_hash: passwordHash
      });
    }
    const createdUsers = await User.insertMany(userDocs);
    console.log('5 Test users loaded successfully.');

    // 4. Generate 100 Flights distributed over the next 30 days
    console.log('Generating 100 flights...');
    const flightDocs = [];
    const airports = ['DEL', 'BOM', 'BLR', 'CCU', 'MAA', 'HYD'];
    const airlines = ['AI', '6E', 'UK', 'SG', 'I5'];
    
    const baseDate = new Date(); // Starts today

    for (let i = 1; i <= 100; i++) {
      // Loop across combinations of airports ensuring src !== dst
      const srcIdx = i % airports.length;
      let dstIdx = (i + 1) % airports.length;
      if (srcIdx === dstIdx) dstIdx = (dstIdx + 1) % airports.length;

      // Increment dates sequentially so flights map smoothly over the next month
      const departureTime = new Date(baseDate);
      departureTime.setDate(baseDate.getDate() + (i % 30)); // Cycle day ranges 0-29
      departureTime.setHours(6 + (i % 15), (i % 4) * 15, 0, 0); // Stagger hours and minutes

      // Flight duration ranges between 2 to 3.5 hours
      const flightDurationMs = (2 * 60 * 60 * 1000) + ((i % 4) * 30 * 60 * 1000);
      const arrivalTime = new Date(departureTime.getTime() + flightDurationMs);

      flightDocs.push({
        flight_no: `${airlines[i % airlines.length]}-${100 + i}`,
        source_airport: airports[srcIdx],
        destination_airport: airports[dstIdx],
        departure_time: departureTime,
        arrival_time: arrivalTime,
        seats: generateSeats()
      });
    }
    const createdFlights = await Flight.insertMany(flightDocs);
    console.log(`Successfully generated ${createdFlights.length} flights.`);

    // 5. Generate 100 Bookings mapping the 5 users across the 100 flights
    console.log('Generating 100 booking manifests...');
    const bookingDocs = [];
    const seatLabels = ['1A', '1B', '2C', '3D'];

    for (let i = 0; i < 100; i++) {
      // Cycle through our 5 users (0 to 4)
      const targetUser = createdUsers[i % createdUsers.length];
      const targetFlight = createdFlights[i];
      const chosenSeatNo = seatLabels[i % seatLabels.length];

      // Mark the selected seat as occupied inside the specific embedded array configuration
      const seatToUpdate = targetFlight.seats.find(s => s.seat_no === chosenSeatNo);
      if (seatToUpdate) {
        seatToUpdate.is_booked = true;
      }
      
      // Save structural sub-document configuration modification state
      await targetFlight.save();

      bookingDocs.push({
        user_id: targetUser._id,
        flight_id: targetFlight._id,
        seat_no: chosenSeatNo,
        booking_date: new Date(targetFlight.departure_time.getTime() - (24 * 60 * 60 * 1000 * 3)), // Booked 3 days prior
        status: i % 20 === 0 ? 'cancelled' : 'confirmed'
      });
    }
    await Booking.insertMany(bookingDocs);
    console.log('Successfully loaded 100 booking relationships.');

    console.log('\n--- SEEDING RUN COMPLETE ---');
    console.log(`Total Users Documents:   ${await User.countDocuments()}`);
    console.log(`Total Flights Documents: ${await Flight.countDocuments()}`);
    console.log(`Total Bookings Documents: ${await Booking.countDocuments()}`);
    console.log('----------------------------\nDatabase seeded flawlessly!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();