// server.js - Fixed & Complete Backend Server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db'); // Import database connection

const app = express();

// ========================================
// MIDDLEWARE
// ========================================
app.use(cors()); // Enable CORS for frontend
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.json()); // Additional JSON parsing
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    if (req.headers['user_id']) {
        console.log(`👤 User ID: ${req.headers['user_id']}`);
    }
    next();
});

// ========================================
// STATIC FILES
// ========================================
// Serve static images
app.use('/Images', express.static(path.join(__dirname, '../Images')));

// ========================================
// ROUTES
// ========================================
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');

// Mount routes with proper prefixes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Plural to match frontend
app.use('/api/cart', cartRoutes);

// ========================================
// HEALTH CHECK & TEST ROUTES
// ========================================
// Root route
app.get('/', (req, res) => {
    res.json({ 
        status: 'Server is running',
        message: 'Amazon Clone Backend API',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            cart: '/api/cart',
            health: '/health',
            testDb: '/api/test-db'
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Database connection test
app.get('/api/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, results) => {
        if (err) {
            console.error('❌ Database test failed:', err.message);
            return res.status(500).json({ 
                status: 'error',
                error: 'Database connection failed',
                details: err.message 
            });
        }
        res.json({ 
            status: 'success',
            message: 'Database connected successfully!',
            result: results[0].result,
            timestamp: new Date().toISOString()
        });
    });
});

// ========================================
// ERROR HANDLING
// ========================================
// 404 handler - Must be after all routes
app.use((req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({ 
        error: 'Route not found',
        path: req.path,
        method: req.method,
        message: `The endpoint ${req.method} ${req.path} does not exist`,
        availableEndpoints: [
            '/api/auth/signup',
            '/api/auth/signin',
            '/api/auth/profile',
            '/api/products',
            '/api/cart',
            '/health'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(err.status || 500).json({ 
        error: 'Internal server error',
        message: err.message,
        path: req.path
    });
});

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 3000;

// Test database connection before starting server
db.query('SELECT 1', (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('⚠️  Please check your database configuration in db.js');
        console.error('⚠️  Make sure MySQL is running and credentials are correct');
        process.exit(1);
    }
    
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log('🚀 Server started successfully!');
        console.log('='.repeat(60));
        console.log(`📍 Server URL: http://localhost:${PORT}`);
        console.log(`📍 Health Check: http://localhost:${PORT}/health`);
        console.log(`📍 Test Database: http://localhost:${PORT}/api/test-db`);
        console.log('');
        console.log('📂 Available Routes:');
        console.log(`   ├─ POST /api/auth/signup`);
        console.log(`   ├─ POST /api/auth/signin`);
        console.log(`   ├─ GET  /api/auth/profile`);
        console.log(`   ├─ PUT  /api/auth/profile`);
        console.log(`   ├─ DELETE /api/auth/account`);
        console.log(`   ├─ GET  /api/products`);
        console.log(`   ├─ GET  /api/cart`);
        console.log(`   └─ POST /api/cart/add`);
        console.log('');
        console.log('✨ Server is ready to accept requests!');
        console.log('='.repeat(60));
        console.log('');
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM signal received: closing HTTP server');
    db.end((err) => {
        if (err) console.error('Error closing database connection:', err);
        console.log('✅ Database connection closed');
        process.exit(0);
    });
});

module.exports = app;