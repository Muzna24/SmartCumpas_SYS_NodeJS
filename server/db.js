require('dotenv').config();
const oracledb = require('oracledb');

// Makes query results come back as plain objects (e.g. row.NAME) instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

// One shared connection pool for the whole app
const poolPromise = oracledb.createPool(config)
    .then(pool => {
        console.log('Connected to Oracle Database');
        return pool;
    })
    .catch(err => {
        console.error('Database connection failed:', err.message);
        throw err;
    });

module.exports = { oracledb, poolPromise };