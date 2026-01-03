-- GlobeTrotter Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS stop_activities CASCADE;
DROP TABLE IF EXISTS trip_stops CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100),
    photo_url VARCHAR(500),
    additional_info TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cities table
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    cost_index INTEGER DEFAULT 50,
    popularity_score INTEGER DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0,
    duration INTEGER,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_cost DECIMAL(10, 2) DEFAULT 0,
    cover_photo VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trip stops (cities in a trip)
CREATE TABLE trip_stops (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    order_index INTEGER NOT NULL,
    notes TEXT,
    name VARCHAR(200),
    budget DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stop activities (activities for each stop)
CREATE TABLE stop_activities (
    id SERIAL PRIMARY KEY,
    stop_id INTEGER REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    scheduled_date DATE,
    scheduled_time TIME,
    cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trip_stops_trip_id ON trip_stops(trip_id);
CREATE INDEX idx_stop_activities_stop_id ON stop_activities(stop_id);
CREATE INDEX idx_activities_city_id ON activities(city_id);
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_cities_country ON cities(country);
