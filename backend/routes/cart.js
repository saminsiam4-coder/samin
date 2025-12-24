// routes/cart.js - Complete Shopping Cart API
const express = require('express');
const router = express.Router();
const db = require('../db');

// ========================================
// MIDDLEWARE: Verify User (Simple Token Check)
// ========================================
function verifyUser(req, res, next) {
    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'User ID required' });
    }
    req.userId = userId;
    next();
}

// ========================================
// ADD TO CART
// ========================================
router.post('/add', verifyUser, async (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const userId = req.userId;

    console.log('🛒 Add to cart:', { userId, product_id, quantity });

    if (!product_id) {
        return res.status(400).json({ error: 'Product ID required' });
    }

    try {
        // Check if product exists and has stock
        const [product] = await dbQuery('SELECT * FROM products WHERE product_id = ?', [product_id]);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // Get or create user's cart
        let [cart] = await dbQuery('SELECT * FROM carts WHERE user_id = ?', [userId]);
        
        if (!cart) {
            const result = await dbQuery('INSERT INTO carts (user_id) VALUES (?)', [userId]);
            cart = { cart_id: result.insertId };
        }

        // Check if item already in cart
        const [existingItem] = await dbQuery(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cart.cart_id, product_id]
        );

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            await dbQuery(
                'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
                [newQuantity, existingItem.cart_item_id]
            );
            
            res.json({ 
                message: 'Cart updated', 
                quantity: newQuantity,
                product_name: product.name 
            });
        } else {
            // Add new item
            await dbQuery(
                'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
                [cart.cart_id, product_id, quantity]
            );
            
            res.json({ 
                message: 'Product added to cart', 
                product_name: product.name 
            });
        }

    } catch (error) {
        console.error('❌ Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// ========================================
// GET CART ITEMS
// ========================================
router.get('/', verifyUser, async (req, res) => {
    const userId = req.userId;

    try {
        const items = await dbQuery(`
            SELECT 
                ci.cart_item_id,
                ci.quantity,
                p.product_id,
                p.name,
                p.price,
                p.image,
                p.category,
                p.stock,
                (ci.quantity * p.price) as subtotal
            FROM carts c
            JOIN cart_items ci ON c.cart_id = ci.cart_id
            JOIN products p ON ci.product_id = p.product_id
            WHERE c.user_id = ?
            ORDER BY ci.added_at DESC
        `, [userId]);

        const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        res.json({
            items,
            total: total.toFixed(2),
            count: items.length
        });

    } catch (error) {
        console.error('❌ Get cart error:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// ========================================
// UPDATE CART ITEM QUANTITY
// ========================================
router.put('/update/:cart_item_id', verifyUser, async (req, res) => {
    const { cart_item_id } = req.params;
    const { quantity } = req.body;
    const userId = req.userId;

    if (quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    try {
        // Verify item belongs to user
        const [item] = await dbQuery(`
            SELECT ci.*, p.stock 
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.cart_item_id = ? AND c.user_id = ?
        `, [cart_item_id, userId]);

        if (!item) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        if (quantity > item.stock) {
            return res.status(400).json({ error: `Only ${item.stock} items available` });
        }

        await dbQuery(
            'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
            [quantity, cart_item_id]
        );

        res.json({ message: 'Cart updated', quantity });

    } catch (error) {
        console.error('❌ Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// ========================================
// REMOVE FROM CART
// ========================================
router.delete('/remove/:cart_item_id', verifyUser, async (req, res) => {
    const { cart_item_id } = req.params;
    const userId = req.userId;

    try {
        // Verify item belongs to user
        const [item] = await dbQuery(`
            SELECT ci.* 
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            WHERE ci.cart_item_id = ? AND c.user_id = ?
        `, [cart_item_id, userId]);

        if (!item) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        await dbQuery('DELETE FROM cart_items WHERE cart_item_id = ?', [cart_item_id]);

        res.json({ message: 'Item removed from cart' });

    } catch (error) {
        console.error('❌ Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// ========================================
// CLEAR CART
// ========================================
router.delete('/clear', verifyUser, async (req, res) => {
    const userId = req.userId;

    try {
        await dbQuery(`
            DELETE ci FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            WHERE c.user_id = ?
        `, [userId]);

        res.json({ message: 'Cart cleared' });

    } catch (error) {
        console.error('❌ Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

// ========================================
// GET CART COUNT
// ========================================
router.get('/count', verifyUser, async (req, res) => {
    const userId = req.userId;

    try {
        const [result] = await dbQuery(`
            SELECT COALESCE(SUM(ci.quantity), 0) as count
            FROM carts c
            LEFT JOIN cart_items ci ON c.cart_id = ci.cart_id
            WHERE c.user_id = ?
        `, [userId]);

        res.json({ count: result.count || 0 });

    } catch (error) {
        console.error('❌ Get cart count error:', error);
        res.status(500).json({ count: 0 });
    }
});

// ========================================
// HELPER: Promisified DB Query
// ========================================
function dbQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

module.exports = router;