const oracledb = require('oracledb');
require('dotenv').config();

async function test() {
    try {
        console.log('Creating pool...');
        const pool = await oracledb.createPool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });
        console.log('POOL SUCCESS!');
        await pool.close(0);
    } catch (err) {
        console.error('POOL FAILED:', err.message);
    }
}

test();