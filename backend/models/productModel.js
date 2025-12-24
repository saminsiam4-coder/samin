// models/productModel.js - FIXED VERSION
const db = require('../db');

const Product = {
    // Search products by name or category
    search: (query) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT product_id, name, category, price, stock, image, description 
                FROM products 
                WHERE name LIKE ? OR category LIKE ? OR description LIKE ?
                ORDER BY name ASC
            `;
            const term = `%${query}%`;
            
            db.query(sql, [term, term, term], (err, results) => {
                if (err) {
                    console.error('❌ Database query error:', err);
                    return reject(err);
                }
                console.log(`✅ Found ${results.length} products for query: "${query}"`);
                resolve(results);
            });
        });
    },

    // Get all products
    getAll: () => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM products ORDER BY created_at DESC';
            db.query(sql, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    // Get product by ID
    getById: (id) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM products WHERE product_id = ?';
            db.query(sql, [id], (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
    },

    // Get products by category
    getByCategory: (category) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM products WHERE category = ?';
            db.query(sql, [category], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
};

module.exports = Product;