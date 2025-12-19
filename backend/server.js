const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const hostname = "127.0.0.1";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);

const PORT = 5000;
app.listen(PORT, hostname, () => {
  console.log('Server running at http://${hostname}:${PORT}');
});