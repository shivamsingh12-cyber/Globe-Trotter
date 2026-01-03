const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

async function debugLogin() {
    try {
        console.log('--- DEBUG LOGIN START ---');
        const email = 'admin@globetrotter.com';
        const password = 'admin@1234';

        // 1. Check if user exists
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (res.rows.length === 0) {
            console.error('❌ User NOT found in database!');
        } else {
            console.log('✅ User found:', res.rows[0].email);
            const user = res.rows[0];

            // 2. Check password
            console.log('stored hash:', user.password_hash);
            const match = await bcrypt.compare(password, user.password_hash);
            console.log('Password match result:', match);

            if (!match) {
                console.log('⚠️ Password mismatch! Generating new hash...');
                const salt = await bcrypt.genSalt(10);
                const newHash = await bcrypt.hash(password, salt);
                console.log('New Hash:', newHash);

                await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, email]);
                console.log('✅ Updated user password hash in DB.');

                // Verify again
                const verify = await bcrypt.compare(password, newHash);
                console.log('Verification of new hash:', verify);
            } else {
                console.log('✅ Password matches correctly.');
            }
        }
    } catch (err) {
        console.error('Debug Error:', err);
    } finally {
        await pool.end();
        console.log('--- DEBUG END ---');
    }
}

debugLogin();
