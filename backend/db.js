// db.js - Database Connection File
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',           // Change to your MySQL username
    password: 'root',           // Change to your MySQL password
    database: 'amazon_clone'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to MySQL database: amazon_clone');
});

module.exports = db;