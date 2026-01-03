require('dotenv').config();
const pool = require('./config/database');

const updateSchema = async () => {
  try {
    console.log('Adding "budget" and "name" columns to trip_stops table...');

    // Add budget column if it doesn't exist
    await pool.query(`
      ALTER TABLE trip_stops 
      ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2) DEFAULT 0;
    `);

    // Add name column if it doesn't exist (Section Title)
    await pool.query(`
      ALTER TABLE trip_stops 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    `);

    console.log('Schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
};

updateSchema();
