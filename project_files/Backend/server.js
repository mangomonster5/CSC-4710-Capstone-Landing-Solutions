const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5001;

// *
//OG encrypt func
// *
const bcrypt = require('bcrypt');

//* 
// allows port comms and json translation
// *
app.use(cors());
app.use(express.json());

// Make connection to landing_solutions.db
const db = new sqlite3.Database('./landing_solutions.db', (err) => {
    // Handle Error
    if (err) {
        // Log error
        console.error('Database connection failed:', err.message);
    } else {
        // Log successful connection
        console.log('Connected to SQLite database');
    }
});



// TEST ROUTE (END POINT)
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Backend is running!' });
});


// Frontend enpoint to get all flights
app.get('/GetAllFlights', (req, res) => {
    db.all('SELECT * FROM all_flights', [], (err, rows) => {
        if (err) {
            console.error("Fetch error:", err.message);
            return res.status(500).json([]);
        }
        res.json(rows);
    });
})


// *
// my endpoint thing looking for post
// *
app.post('/api/login', (req, res) => {

    // *
    // pulls data out of the req
    // *
    const { username, password } = req.body;
    db.get(

        // *
        // pre selected query with ? placeholder
        // *
        'SELECT * FROM users WHERE username = ?',
        [username],

        // *
        // after db runs error loop
        // * 
        async (err, row) => {
            if (err) {

                // *
                // in case jack or myself broke something
                // * 
                return res.status(500).json({ error: err.message });
            }
            if (!row) {

                //*
                // incorrect login
                // *
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            // *
            // users found and salt occurs to ensure correct password
            // * 
            const match = await bcrypt.compare(password, row.password);
            if (match) {
                res.json({ success: true, role: row.role, user: row });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        }
    );
});

// ADD FLIGHT (finley)
app.post('/api/flights', (req, res) => {
    const { from_airport, to_airport, flight_number } = req.body;
    db.run(
        `INSERT INTO flights (from_airport, to_airport, flight_number)
         VALUES (?, ?, ?)`,
        [from_airport, to_airport, flight_number],
        function (err) {
            if (err) {
                console.error("Insert error:", err.message);
                return res.status(500).json({ success: false });
            }
            res.json({ success: true });
        }
    );
});

// GET FLIGHTS (finley)
app.get('/api/flights', (req, res) => {
    db.all('SELECT * FROM flights', [], (err, rows) => {
        if (err) {
            console.error("Fetch error:", err.message);
            return res.status(500).json([]);
        }
        res.json(rows);
    });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});