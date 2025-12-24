// routes/auth.js - UPDATED to handle single name field
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "supersecret"; // Change this in production

// ========================================
// SIGNUP - Handles both single and split names
// ========================================
router.post('/signup', async (req, res) => {
    let { first_name, last_name, name, email, password, phone } = req.body;
    
    console.log('📥 Received signup data:', req.body);

    // Handle single "name" field by splitting it
    if (!first_name && !last_name && name) {
        const nameParts = name.trim().split(' ');
        first_name = nameParts[0] || '';
        last_name = nameParts.slice(1).join(' ') || nameParts[0]; // If no last name, use first name
        
        console.log(`📝 Split name "${name}" into:`, { first_name, last_name });
    }

    // Validation
    if (!first_name || !last_name) {
        return res.status(400).json({ 
            error: 'First name and last name are required' 
        });
    }

    if (!email) {
        return res.status(400).json({ 
            error: 'Email is required' 
        });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ 
            error: 'Password must be at least 6 characters' 
        });
    }

    // Check if user already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (checkErr, existingUsers) => {
        if (checkErr) {
            console.error('❌ Database check error:', checkErr);
            return res.status(500).json({ error: 'Database error' });
        }

        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                error: 'Email already exists. Please sign in or use a different email.' 
            });
        }

        // Insert new user
        const insertQuery = `
            INSERT INTO users (first_name, last_name, email, password_hash, phone) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(insertQuery, [first_name, last_name, email, password, phone], (err, result) => {
            if (err) {
                console.error('❌ Insert error:', err);
                return res.status(500).json({ error: err.message });
            }

            console.log('✅ User created successfully:', result.insertId);
            
            res.json({ 
                message: 'User created successfully', 
                user_id: result.insertId,
                first_name: first_name,
                last_name: last_name
            });
        });
    });
});

// ========================================
// SIGNIN
// ========================================
router.post('/signin', (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔐 Sign in attempt for:', email);

    if (!email || !password) {
        return res.status(400).json({ 
            error: 'Email and password are required' 
        });
    }
    
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: err.message });
        }

        if (!results.length) {
            console.log('❌ User not found:', email);
            return res.status(400).json({ 
                error: 'User not found. Please check your email or create an account.' 
            });
        }

        const user = results[0];
        
        // Direct password comparison (no bcrypt)
        if (password !== user.password_hash) {
            console.log('❌ Wrong password for:', email);
            return res.status(400).json({ 
                error: 'Incorrect password. Please try again.' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { user_id: user.user_id }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        console.log('✅ Sign in successful for:', user.email);

        res.json({ 
            token, 
            user_id: user.user_id, 
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            message: 'Login successful'
        });
    });
});

// ========================================
// VERIFY TOKEN (Optional - for protected routes)
// ========================================
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        db.query('SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?', 
            [decoded.user_id], 
            (err, results) => {
                if (err || !results.length) {
                    return res.status(401).json({ error: 'Invalid token' });
                }
                res.json({ user: results[0] });
            }
        );
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;