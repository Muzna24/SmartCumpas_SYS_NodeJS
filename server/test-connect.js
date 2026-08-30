require('dotenv').config();

const mysql = require('mysql2/promise');

async function test() {
    let conn;

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('SUCCESS! Connected to MySQL Database');

        const [rows] = await conn.query('SELECT DATABASE() AS database_name');

        console.log('Database:', rows[0].database_name);

    } catch (err) {
        console.error('FAILED:', err.message);
        console.error('Error code:', err.code);

    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

test();



