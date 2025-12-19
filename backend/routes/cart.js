const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "supersecret";

// Middleware to check token
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.user_id = decoded.user_id;
        next();
    });
};

// Add product to cart
router.post('/add', authMiddleware, (req, res) => {
    const { product_id, quantity } = req.body;

    // Find or create cart
    db.query(`SELECT * FROM carts WHERE user_id = ?`, [req.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        let cart_id;
        if (results.length) {
            cart_id = results[0].cart_id;
            addToCart(cart_id);
        } else {
            db.query(`INSERT INTO carts (user_id) VALUES (?)`, [req.user_id], (err, result) => {
                if (err) return res.status(500).json({ error: err });
                cart_id = result.insertId;
                addToCart(cart_id);
            });
        }

        function addToCart(cart_id) {
            // Check if product already in cart
            db.query(`SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`, [cart_id, product_id], (err, results) => {
                if (err) return res.status(500).json({ error: err });
                if (results.length) {
                    // Update quantity
                    db.query(`UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?`, [quantity, cart_id, product_id], (err) => {
                        if (err) return res.status(500).json({ error: err });
                        res.json({ message: 'Cart updated' });
                    });
                } else {
                    // Insert new
                    db.query(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`, [cart_id, product_id, quantity], (err) => {
                        if (err) return res.status(500).json({ error: err });
                        res.json({ message: 'Product added to cart' });
                    });
                }
            });
        }
    });
});

// Get cart items
router.get('/', authMiddleware, (req, res) => {
    db.query(`SELECT cart_id FROM carts WHERE user_id = ?`, [req.user_id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (!results.length) return res.json([]);

        const cart_id = results[0].cart_id;
        db.query(`
            SELECT ci.cart_item_id, ci.quantity, p.product_id, p.name, p.price, p.image_url
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.cart_id = ?
        `, [cart_id], (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        });
    });
});

module.exports = router;