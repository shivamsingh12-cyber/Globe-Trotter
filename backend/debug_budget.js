const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkBudget() {
    try {
        // Check specific trip (ID 7 based on logs)
        const tripId = 7;
        console.log(`Checking budget for trip ${tripId}...`);

        // 1. Check raw stops
        const stops = await pool.query('SELECT id, name, budget FROM trip_stops WHERE trip_id = $1', [tripId]);
        console.log('Stops:', stops.rows);

        // 2. Check raw activities
        const activities = await pool.query(`
      SELECT sa.id, sa.cost 
      FROM stop_activities sa 
      JOIN trip_stops ts ON sa.stop_id = ts.id 
      WHERE ts.trip_id = $1
    `, [tripId]);
        console.log('Activities:', activities.rows);

        // 3. Run the exact subquery logic
        const query = `
      SELECT t.id, t.name,
             (
               COALESCE((SELECT SUM(budget) FROM trip_stops WHERE trip_id = t.id), 0) +
               COALESCE((SELECT SUM(sa.cost) FROM stop_activities sa JOIN trip_stops ts ON sa.stop_id = ts.id WHERE ts.trip_id = t.id), 0)
             ) as total_cost_calculated
      FROM trips t
      WHERE t.id = $1
    `;
        const result = await pool.query(query, [tripId]);
        console.log('Calculated Result:', result.rows[0]);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkBudget();
