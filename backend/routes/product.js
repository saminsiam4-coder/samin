// routes/product.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// Search products
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        console.log('🔍 Search endpoint called with query:', q);

        if (!q || q.trim() === '') {
            return res.status(400).json({ 
                message: 'Please enter a search term',
                data: [] 
            });
        }

        const results = await Product.search(q.trim());

        if (results.length === 0) {
            return res.json({ 
                message: `No products found for "${q}"`,
                data: [] 
            });
        }

        console.log(`✅ Returning ${results.length} products`);
        res.json(results);

    } catch (err) {
        console.error('❌ Search error:', err);
        res.status(500).json({ 
            error: 'Server error during search',
            message: err.message 
        });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.getAll();
        res.json(products);
    } catch (err) {
        console.error('❌ Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error('❌ Error fetching product:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.getByCategory(req.params.category);
        res.json(products);
    } catch (err) {
        console.error('❌ Error fetching category products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Debug route
router.get('/debug/info', async (req, res) => {
    try {
        const db = require('../db');
        
        db.query('SELECT COUNT(*) AS total FROM products', (err, countRows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            db.query('SELECT product_id, name, category, price FROM products LIMIT 10', (err2, sampleRows) => {
                if (err2) return res.status(500).json({ error: err2.message });
                
                res.json({ 
                    total: countRows[0].total, 
                    sample: sampleRows,
                    message: 'Database connection working!'
                });
            });
        });
    } catch (err) {
        console.error('❌ Debug error:', err);
        res.status(500).json({ error: 'Debug failed' });
    }
});

module.exports = router;