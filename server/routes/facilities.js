const express = require('express');
const router = express.Router();
const { oracledb, poolPromise } = require('../db');

// GET /api/facilities - full list with location, capacity, status
router.get('/', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute('SELECT * FROM Facility_Full_View');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET /api/facilities/:id/availability?date=YYYY-MM-DD
router.get('/:id/availability', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param is required.' });

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                GetAvailableTimeSlots(:FacilityID, :BookingDate, :cursorOut);
             END;`,
            {
                FacilityID: parseInt(req.params.id, 10),
                BookingDate: new Date(date),
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

// GET /api/facilities/:id/best-window?date=YYYY-MM-DD
router.get('/:id/best-window', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param is required.' });

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `SELECT Get_Max_Continuous_Availability(:FacilityID, :BookingDate) AS "BestWindow" FROM DUAL`,
            {
                FacilityID: parseInt(req.params.id, 10),
                BookingDate: new Date(date)
            }
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// POST /api/facilities - admin adds a new facility
router.post('/', async (req, res) => {
    const { facilityName, buildingName, floor, capacity, status } = req.body;
    if (!facilityName || !buildingName || floor === undefined || !capacity || !status) {
        return res.status(400).json({ error: 'facilityName, buildingName, floor, capacity, and status are all required.' });
    }

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                AddFacility(:FacilityName, :BuildingName, :Floor, :Capacity, :Status, :Result);
             END;`,
            {
                FacilityName: facilityName,
                BuildingName: buildingName,
                Floor: floor,
                Capacity: capacity,
                Status: status,
                Result: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 255 }
            }
        );

        await connection.commit();
        res.status(201).json({ message: result.outBinds.Result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// DELETE /api/facilities/:id - admin removes a facility
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                DeleteFacility(:FacilityID, :Result);
             END;`,
            {
                FacilityID: parseInt(req.params.id, 10),
                Result: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 255 }
            }
        );

        const message = result.outBinds.Result;
        if (message.startsWith('Error')) {
            return res.status(409).json({ error: message });
        }
        await connection.commit();
        res.json({ message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});


// GET /api/facilities/:id/all-slots?date=YYYY-MM-DD
router.get('/:id/all-slots', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param is required.' });

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                GetAllSlotsWithStatus(:FacilityID, :BookingDate, :cursorOut);
             END;`,
            {
                FacilityID: req.params.id,
                BookingDate: new Date(date),
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


const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'public', 'images', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// POST /api/facilities - admin adds a new facility (with photo upload)
router.post('/', upload.single('photo'), async (req, res) => {
    const { facilityName, buildingName, floor, capacity, status } = req.body;
    if (!facilityName || !buildingName || floor === undefined || !capacity || !req.file) {
        return res.status(400).json({ error: 'facilityName, buildingName, floor, capacity, status, and a photo are all required.' });
    }

    const photoPath = 'images/uploads/' + req.file.filename;

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                AddFacility(:FacilityName, :BuildingName, :Floor, :Capacity, :Status, :PhotoPath, :Result);
             END;`,
            {
                FacilityName: facilityName,
                BuildingName: buildingName,
                Floor: floor,
                Capacity: capacity,
                Status: status,
                PhotoPath: photoPath,
                Result: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 255 }
            }
        );

        await connection.commit();
        res.status(201).json({ message: result.outBinds.Result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// PUT /api/facilities/:id/status - admin toggles Active/Inactive
router.put('/:id/status', async (req, res) => {
    const { status } = req.body;
    if (!status || (status !== 'Active' && status !== 'Inactive')) {
        return res.status(400).json({ error: 'status must be Active or Inactive.' });
    }

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                UpdateFacilityStatus(:FacilityID, :Status, :Result);
             END;`,
            {
                FacilityID: parseInt(req.params.id, 10),
                Status: status,
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