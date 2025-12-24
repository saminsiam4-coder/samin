const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// ✅ CORRECT ROUTE IMPORTS
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const Product = require('./models/productModel'); // Correct path
// NOTE: models are not Express routers — don't `require` them as routes.
// If you need product-related HTTP endpoints, create a router in `routes/product.js`.
// ✅ USE ROUTES
app.use('/api/auth', authRoutes);
// Mount product routes at '/api/products' (plural) to match frontend requests
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
// removed: productModel is a data model, not an Express router

// static images
app.use('/Images', express.static(path.join(__dirname, '../Images')));

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
