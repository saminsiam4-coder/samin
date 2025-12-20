const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import routes
const authRoutes = require('../backend/routes/auth');
const productRoutes = require('../backend/routes/product');
const cartRoutes = require('../backend/routes/cart');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

const PORT = 5500;
app.listen(PORT, () => console.log('Server running on port ${PORT}'));
