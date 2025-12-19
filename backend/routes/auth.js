const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "supersecret"; // change this in production

// Sign up
router.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password, phone } = req.body;
    
    const query = `INSERT INTO users (first_name, last_name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [first_name, last_name, email, password, phone], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User created successfully', user_id: result.insertId });
    });
});

// Sign in
router.post('/signin', (req, res) => {
    const { email, password } = req.body;
    
    db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!results.length) return res.status(400).json({ error: 'User not found' });

        const user = results[0];
        
        // Direct password comparison (no bcrypt)
        if (password !== user.password_hash) {
            return res.status(400).json({ error: 'Wrong password' });
        }

        const token = jwt.sign({ user_id: user.user_id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ 
            token, 
            user_id: user.user_id, 
            first_name: user.first_name,
            message: 'Login successful'
        });
    });
});

module.exports = router;