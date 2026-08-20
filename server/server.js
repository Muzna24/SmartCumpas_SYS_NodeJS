require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const studentsRouter = require('./routes/students');
const facilitiesRouter = require('./routes/facilities');
const bookingsRouter = require('./routes/bookings');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 4 // 4 hours
    }
}));

// Serve the frontend (public/) as static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/facilities', facilitiesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});