const express = require('express');
const router = express.Router();
const Product = require('../models/productModel'); // Import the class above

router.get('/search', async (req, res) => {
    const { q } = req.query;

    // 1. Check if search term exists
    if (!q) {
        return res.status(400).json({ message: 'Please enter a search term' });
    }

    try {
        // 2. Call the Model method
        const results = await Product.search(q);

        // 3. Handle "Not Found" case
        if (results.length === 0) {
            return res.json({ message: 'No products found', data: [] });
        }

        // 4. Return results
        res.json(results);

    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).send('Server error');
    }
});

module.exports = router;