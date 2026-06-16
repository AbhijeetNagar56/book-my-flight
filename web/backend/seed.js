import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Flight from './models/Flight.js';
import Booking from './models/Booking.js';

dotenv.config();

const generateSeats = () => {
  const seats = [];
  const classes = ['first_class', 'business', 'premium_economy', 'economy'];
  
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
    console.log('Connected to MongoDB for seeding...');

    // 2. Clear out any existing data to start fresh
    await User.deleteMany({});
    await Flight.deleteMany({});
    await Booking.deleteMany({});
    console.log('Existing collections cleared.');

    // 3. Create a Dummy User (Password: password123)
    const passwordHash = await bcrypt.hash('password123', 10);
    const dummyUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      mobile: '9876543210',
      gender: 'male',
      date_of_birth: new Date('1998-05-15'),
      password_hash: passwordHash
    });
    console.log('Dummy user inserted successfully.');

    // 4. Setup Target Dates (Today and Tomorrow)
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 30, 0, 0);

    // 5. Create Dummy Flights with Embedded Seats Arrays
    const dummyFlights = [
      {
        flight_no: 'AI-101',
        source_airport: 'DEL',
        destination_airport: 'BOM',
        departure_time: today,
        arrival_time: new Date(today.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        seats: generateSeats()
      },
      {
        flight_no: '6E-204',
        source_airport: 'DEL',
        destination_airport: 'BOM',
        departure_time: tomorrow,
        arrival_time: new Date(tomorrow.getTime() + 2.5 * 60 * 60 * 1000),
        seats: generateSeats()
      },
      {
        flight_no: 'UK-951',
        source_airport: 'BOM',
        destination_airport: 'DEL',
        departure_time: today,
        arrival_time: new Date(today.getTime() + 2 * 60 * 60 * 1000),
        seats: generateSeats()
      }
    ];

    await Flight.insertMany(dummyFlights);
    console.log('Dummy flights and nested seats loaded successfully.');

    console.log('\n Database seeding complete! Ready for testing.');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();