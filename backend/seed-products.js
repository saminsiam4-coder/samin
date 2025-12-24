const db = require('./db');

const products = [
    { name: 'Blue Shirt', category: 'Clothes', price: 799, stock: 50, image: '/Images/shirt.webp' },
    { name: 'White Panjabi', category: 'Clothes', price: 7599, stock: 30, image: '/Images/punjabi.jpg' },
    { name: 'Smart Watch', category: 'Electronics', price: 2998, stock: 60, image: '/Images/smart-watch.png' },
    { name: 'Wireless Headphones', category: 'Electronics', price: 3599, stock: 45, image: '/Images/Headphones.jpg' },
    { name: 'Gaming Chair', category: 'Furniture', price: 7599, stock: 25, image: '/Images/gaming-chair.jpg' },
    { name: 'White Sofa', category: 'Furniture', price: 12000, stock: 10, image: '/Images/sofa.jpg' },
    { name: 'CeraVe Hydrating Facial Cleanser', category: 'Health & Personal Care', price: 2500, stock: 100, image: '/Images/ceraVe.jpg' },
    { name: 'Black Hawk Dog Food', category: 'Pet Care', price: 799, stock: 100, image: '/Images/Dog_1.jpg' },
    { name: 'Yeonha Toys 60 Piece Mini Zoo Animal Set', category: 'Toys', price: 799, stock: 50, image: '/Images/Toy1.jpg' },
    { name: 'Designer Blue Shirt', category: 'Fashion', price: 799, stock: 45, image: '/Images/shirt.webp' }
];

let inserted = 0;

products.forEach(product => {
    const query = 'INSERT INTO products (name, category, price, stock, image) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [product.name, product.category, product.price, product.stock, product.image], (err) => {
        if (err) {
            console.error(`Error inserting ${product.name}:`, err.message);
        } else {
            inserted++;
            console.log(`✓ Inserted: ${product.name}`);
        }
        
        if (inserted === products.length) {
            console.log(`\n✅ All ${inserted} products inserted successfully!`);
            process.exit(0);
        }
    });
});
