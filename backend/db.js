const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'amazon_clone'
});

db.connect(err => {
    if (err) {
        console.error('DB connection failed:', err);
        return;
    }
    console.log('DB connected');
});

module.exports = db;