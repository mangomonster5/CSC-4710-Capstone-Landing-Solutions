const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5001;


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




// Check User Auth
app.post('/api/login', (req, res) => {
    // Extract the username and password from request body
    const { username, password } = req.body;

    // send a get request to the database
    db.get(
        // Select all rows from users where the username and password = req.body
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        // Handle err
        (err, row) => {
            // If err, throw response code 500
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // No error
            if (row) {
                // If the user exists, respond with json obj
                res.json({ success: true, user: row });
            } else {
                // If the user does not exist respond with json obj, failed
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});