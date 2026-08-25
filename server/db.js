require('dotenv').config();

const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
    queueLimit: 0
};

// One shared connection pool for the whole app
const pool = mysql.createPool(config);

// Test database connection
const poolPromise = pool.query('SELECT 1')
    .then(() => {
        console.log('Connected to MySQL Database');
        return pool;
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
        throw err;
    });

module.exports = {
    mysql,
    pool,
    poolPromise
};