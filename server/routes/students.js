const express = require('express');
const router = express.Router();
const { oracledb, poolPromise } = require('../db');          // GET /api/students - list all students

router.get('/', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute('SELECT * FROM Student_View');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// POST /api/students - register a new student
router.post('/', async (req, res) => {
    const { studentId, name, email } = req.body;
    if (!studentId || !name || !email) {
        return res.status(400).json({ error: 'studentId, name and email are required.' });
    }
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        await connection.execute(
            'INSERT INTO Students (StudentID, Name, Email) VALUES (:StudentID, :Name, :Email)',
            { StudentID: studentId, Name: name, Email: email }
        );
        await connection.commit();
        res.status(201).json({ message: 'Student registered successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// POST /api/students/register - admin registers a new student
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email, and password are all required.' });
    }

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                RegisterStudent(:Name, :Email, :Password, :NewID, :Result);
             END;`,
            {
                Name: name,
                Email: email,
                Password: password,
                NewID: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
                Result: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 255 }
            }
        );

        const message = result.outBinds.Result;
        if (message.startsWith('Error')) {
            return res.status(409).json({ error: message });
        }
        await connection.commit();
        res.status(201).json({ message, studentId: result.outBinds.NewID });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET /api/students/all - admin views all students (with password hidden)
router.get('/all', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            'SELECT StudentID AS "StudentID", Name AS "Name", Email AS "Email" FROM Students ORDER BY StudentID'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// DELETE /api/students/:id - admin removes a student
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            `BEGIN
                DeleteStudent(:StudentID, :Result);
             END;`,
            {
                StudentID: parseInt(req.params.id, 10),
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

// GET /api/students/me - logged-in student's own profile
router.get('/me', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') {
        return res.status(403).json({ error: 'Students only.' });
    }

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            'SELECT Name AS "Name", Email AS "Email" FROM Students WHERE StudentID = :id',
            { id: req.session.user.studentId }
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// PUT /api/students/me - update own name/email
router.put('/me', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') {
        return res.status(403).json({ error: 'Students only.' });
    }

    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'name and email are required.' });
    }

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();

        const check = await connection.execute(
            'SELECT StudentID FROM Students WHERE Email = :email AND StudentID != :id',
            { email, id: req.session.user.studentId }
        );
        if (check.rows.length > 0) {
            return res.status(409).json({ error: 'That email is already in use.' });
        }

        await connection.execute(
            'UPDATE Students SET Name = :name, Email = :email WHERE StudentID = :id',
            { name, email, id: req.session.user.studentId }
        );
        await connection.commit();

        req.session.user.name = name;
        res.json({ message: 'Profile updated successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// PUT /api/students/me/password - change own password
router.put('/me/password', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'student') {
        return res.status(403).json({ error: 'Students only.' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'currentPassword and newPassword are required.' });
    }

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();

        const result = await connection.execute(
            'SELECT Password FROM Students WHERE StudentID = :id',
            { id: req.session.user.studentId }
        );

        if (result.rows[0].PASSWORD !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        await connection.execute(
            'UPDATE Students SET Password = :pw WHERE StudentID = :id',
            { pw: newPassword, id: req.session.user.studentId }
        );
        await connection.commit();

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;