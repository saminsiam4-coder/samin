// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "supersecret"; // ⚠️ In production, use process.env.JWT_SECRET

// ========================================
// MIDDLEWARE: Protect Routes
// ========================================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    // DEBUG: Print what the server received
    console.log('🔍 Auth Header Received:', authHeader);

    // Check if header exists
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Extract token (removes "Bearer " if present)
    const token = authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token format invalid.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('❌ Token Verification Error:', err.message);
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        
        // Success!
        console.log('✅ Token Verified for User ID:', decoded.user_id);
        req.user = decoded; 
        next();
    });
}

// ========================================
// SIGNUP
// ========================================
router.post('/signup', async (req, res) => {
    let { first_name, last_name, name, email, password, phone } = req.body;
    
    // Handle split name logic
    if (!first_name && !last_name && name) {
        const nameParts = name.trim().split(' ');
        first_name = nameParts[0] || '';
        last_name = nameParts.slice(1).join(' ') || nameParts[0];
    }

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, existingUsers) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const insertQuery = 'INSERT INTO users (first_name, last_name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)';
        db.query(insertQuery, [first_name, last_name, email, password, phone], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'User created successfully' });
        });
    });
});

// ========================================
// SIGNIN
// ========================================
router.post('/signin', (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 Signin attempt for:', email);

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        if (!results.length || results[0].password_hash !== password) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        
        // Generate Token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Signin success. Token generated.');

        // Send Response
        res.json({
            message: 'Login successful',
            token: token,
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email
        });
    });
});

// ========================================
// GET PROFILE (Protected)
// ========================================
router.get('/profile', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    console.log('📋 Fetching profile for User ID:', userId);

    const query = 'SELECT user_id, first_name, last_name, email, phone, created_at FROM users WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!results.length) return res.status(404).json({ error: 'User not found' });
        
        res.json({ user: results[0] });
    });
});

// ========================================
// UPDATE PROFILE (Protected)
// ========================================
router.put('/profile', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const { first_name, last_name, phone, current_password, new_password } = req.body;

    db.query('SELECT * FROM users WHERE user_id = ?', [userId], (err, results) => {
        if (err || !results.length) return res.status(500).json({ error: 'User lookup failed' });
        
        const user = results[0];
        let passwordToSave = user.password_hash;

        if (new_password) {
            if (!current_password) return res.status(400).json({ error: 'Current password required' });
            if (current_password !== user.password_hash) return res.status(400).json({ error: 'Incorrect current password' });
            if (new_password.length < 6) return res.status(400).json({ error: 'Password too short' });
            passwordToSave = new_password;
        }

        const updateQuery = `UPDATE users SET first_name = ?, last_name = ?, phone = ?, password_hash = ? WHERE user_id = ?`;

        db.query(updateQuery, [
            first_name || user.first_name,
            last_name || user.last_name,
            phone || user.phone,
            passwordToSave,
            userId
        ], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: 'Update failed' });

            // Return updated user data (critical for frontend update)
            db.query('SELECT user_id, first_name, last_name, email, phone FROM users WHERE user_id = ?', [userId], (err, updatedUser) => {
                res.json({ 
                    message: 'Profile updated successfully', 
                    user: updatedUser[0] 
                });
            });
        });
    });
});

// ========================================
// DELETE ACCOUNT (Protected)
// ========================================
router.delete('/account', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const { password, confirm } = req.body;

    if (confirm !== 'DELETE') return res.status(400).json({ error: 'Type DELETE to confirm' });

    db.query('SELECT password_hash FROM users WHERE user_id = ?', [userId], (err, results) => {
        if (err || !results.length) return res.status(500).json({ error: 'Database error' });

        if (results[0].password_hash !== password) {
            return res.status(400).json({ error: 'Incorrect password' });
        }

        db.query('DELETE FROM users WHERE user_id = ?', [userId], (delErr) => {
            if (delErr) return res.status(500).json({ error: 'Delete failed' });
            res.json({ message: 'Account deleted successfully' });
        });
    });
});

module.exports = router;