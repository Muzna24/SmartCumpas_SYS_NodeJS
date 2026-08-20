const express = require('express');
const router = express.Router();
const { oracledb, poolPromise } = require('../db');

// GET /api/admin/busy-report
router.get('/busy-report', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                GetBusyReport(:cursorOut);
             END;`,
            {
                cursorOut: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            }
        );
        const resultSet = result.outBinds.cursorOut;
        const rows = await resultSet.getRows();
        await resultSet.close();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET /api/admin/timeslots
router.get('/timeslots', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute('SELECT * FROM Time_Slot ORDER BY TimeSlotID');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});


// GET /api/admin/all-bookings
router.get('/all-bookings', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                GetAllBookings(:cursorOut);
             END;`,
            {
                cursorOut: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            }
        );
        const resultSet = result.outBinds.cursorOut;
        const rows = await resultSet.getRows();
        await resultSet.close();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;