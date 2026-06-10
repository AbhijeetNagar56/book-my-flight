CREATE TYPE seat_type AS ENUM (
    'economy',
    'premium_economy',
    'business',
    'first_class'
);

CREATE TYPE gender_type AS ENUM (
    'male',
    'female',
    'other'
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20) UNIQUE,
    gender gender_type,
    date_of_birth DATE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    flight_no VARCHAR(20) NOT NULL,
    source_airport VARCHAR(10) NOT NULL,
    destination_airport VARCHAR(10) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS seats (
    id SERIAL PRIMARY KEY,
    flight_id INTEGER NOT NULL REFERENCES flights(id),
    seat_no VARCHAR(10) NOT NULL,
    seat_class seat_type NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    UNIQUE (flight_id, seat_no)
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    flight_id INTEGER NOT NULL REFERENCES flights(id),
    seat_id INTEGER NOT NULL REFERENCES seats(id),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'confirmed'
);