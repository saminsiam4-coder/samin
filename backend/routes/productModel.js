const db = require('../db'); // Your pool connection

class Product {
    // Adapted from your restaurant search logic
    static async search(query) {
        const sql = `
            SELECT * FROM products 
            WHERE name LIKE ? OR category LIKE ? OR description LIKE ?
        `;
        const param = `%${query}%`;
        
        // Using the promise-based pool (.execute returns [rows, fields])
        const [rows] = await db.execute(sql, [param, param, param]);
        return rows;
    }
}

module.exports = Product;