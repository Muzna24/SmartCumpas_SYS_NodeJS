const express = require('express');
const router = express.Router();
const { oracledb, poolPromise } = require('../db');

// GET /api/bookings/student/:studentId - "My Bookings"
router.get('/student/:studentId', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                GetBookingsByStudent(:StudentID, :cursorOut);
             END;`,
            {
                StudentID: parseInt(req.params.studentId, 10),
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

// POST /api/bookings - create a booking
router.post('/', async (req, res) => {
    const { bookingDate, facilityId, studentId, timeSlotId } = req.body;
    if (!bookingDate || !facilityId || !studentId || !timeSlotId) {
        return res.status(400).json({ error: 'bookingDate, facilityId, studentId and timeSlotId are all required.' });
    }

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();

        // Get the next sequential BookingID
        const maxResult = await connection.execute('SELECT NVL(MAX(BookingID), 0) + 1 AS "NextID" FROM Booking');
        const nextBookingId = maxResult.rows[0].NextID;

        const result = await connection.execute(
            `BEGIN
                AddBooking(:BookingID, :BookingDate, :FacilityID, :StudentID, :TimeSlotID, :Result);
             END;`,
            {
                BookingID: nextBookingId,
                BookingDate: new Date(bookingDate),
                FacilityID: facilityId,
                StudentID: studentId,
                TimeSlotID: timeSlotId,
                Result: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 255 }
            }
        );

        const message = result.outBinds.Result;
        if (message.startsWith('Error')) {
            return res.status(409).json({ error: message });
        }
        await connection.commit();
        res.status(201).json({ message, bookingId: nextBookingId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// DELETE /api/bookings/:id - cancel a booking
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                DeleteBooking(:BookingID, :Result);
             END;`,
            {
                BookingID: parseInt(req.params.id, 10),
                Result: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 255 }
            }
        );
        const message = result.outBinds.Result;
        if (message.startsWith('Error')) {
            return res.status(404).json({ error: message });
        }
        await connection.commit();
        res.json({ message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;