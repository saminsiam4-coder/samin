const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all products
router.get('/', (req, res) => {
    db.query(`SELECT * FROM products`, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Get single product by ID
router.get('/:id', (req, res) => {
    db.query(`SELECT * FROM products WHERE product_id = ?`, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (!results.length) return res.status(404).json({ error: 'Product not found' });
        res.json(results[0]);
    });
});

module.exports = router;