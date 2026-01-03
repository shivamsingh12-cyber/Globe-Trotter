const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkTripData() {
    try {
        const tripId = 5;
        console.log(`Checking data for trip ${tripId}...`);

        const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
        console.log('Trip:', trip.rows[0]);

        if (trip.rows.length === 0) {
            console.log("TRIP 5 NOT FOUND!");
            return;
        }

        const stops = await pool.query('SELECT * FROM trip_stops WHERE trip_id = $1', [tripId]);
        console.log(`Stops count: ${stops.rows.length}`);
        console.log('Stops data:', stops.rows);

        // Also check cities to see if there's a disconnect
        const cities = await pool.query('SELECT id, name FROM cities LIMIT 5');
        console.log('Sample Cities:', cities.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkTripData();
