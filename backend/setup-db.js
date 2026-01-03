const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false // Required for Supabase
    }
});

async function setupDatabase() {
    try {
        console.log('Connecting to database...');
        // Test connection
        const res = await pool.query('SELECT NOW()');
        console.log('Connected to Supabase:', res.rows[0]);

        // Read SQL files
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const seedPath = path.join(__dirname, '../database/seed.sql');

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        console.log('Running Schema...');
        await pool.query(schemaSql);
        console.log('Schema created successfully.');

        console.log('Running Seed...');
        await pool.query(seedSql);
        console.log('Seed data inserted successfully.');

        console.log('Database setup complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    }
}

setupDatabase();
