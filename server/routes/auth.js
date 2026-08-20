const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

// POST /api/auth/login - handles both students and admin
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required.' });
    }

    // Check admin credentials first
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.user = {
            role: 'admin',
            username
        };
        return res.json({ message: 'Logged in successfully.', role: 'admin' });
    }

    // Otherwise, treat "username" as a Student ID
    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();
        const result = await connection.execute(
            'SELECT StudentID, Name, Password FROM Students WHERE StudentID = :id',
            { id: username }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const student = result.rows[0];

        if (password !== student.PASSWORD) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        req.session.user = {
            role: 'student',
            studentId: student.STUDENTID,
            name: student.NAME
        };

        res.json({ message: 'Logged in successfully.', role: 'student', name: student.NAME });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out.' });
    });
});

// GET /api/auth/me - check current login state
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not logged in.' });
    }
});


// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    const { studentId, newPassword } = req.body;
    if (!studentId || !newPassword) {
        return res.status(400).json({ error: 'studentId and newPassword are required.' });
    }

    let connection;
    try {
        const pool = await poolPromise;
        connection = await pool.getConnection();

        const check = await connection.execute(
            'SELECT StudentID FROM Students WHERE StudentID = :id',
            { id: studentId }
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ error: 'Student ID not found.' });
        }

        await connection.execute(
            'UPDATE Students SET Password = :pw WHERE StudentID = :id',
            { pw: newPassword, id: studentId }
        );
        await connection.commit();

        res.json({ message: 'Password reset successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});


module.exports = router;