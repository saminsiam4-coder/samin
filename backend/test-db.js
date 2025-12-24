const db = require('./db');

db.query('SELECT COUNT(*) as total FROM products', (err, results) => {
    if (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
    console.log('Total products in DB:', results[0].total);
    
    db.query('SELECT id, name, category, price FROM products LIMIT 5', (err2, rows) => {
        if (err2) {
            console.error('Error:', err2.message);
            process.exit(1);
        }
        console.log('\nFirst 5 products:');
        console.table(rows);
        process.exit(0);
    });
});
