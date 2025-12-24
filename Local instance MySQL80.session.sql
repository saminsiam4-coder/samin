-- ============================================
-- Amazon Clone Database Schema (FIXED)
-- ============================================

DROP DATABASE IF EXISTS amazon_clone;
CREATE DATABASE amazon_clone;
USE amazon_clone;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: products (FIXED - using product_id)
-- ============================================
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    image VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: product_images
-- ============================================
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: carts
-- ============================================
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: cart_items (FIXED)
-- ============================================
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id),
    CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: orders
-- ============================================
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: order_items
-- ============================================
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CHECK (quantity > 0),
    CHECK (price_at_purchase >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA: Products
-- ============================================

-- Clothes
INSERT INTO products (name, category, price, stock, image, description) VALUES
('Blue Shirt', 'Clothes', 799.00, 50, '/Images/shirt.webp', 'Comfortable cotton blue shirt for everyday wear'),
('White Panjabi', 'Clothes', 7599.00, 30, '/Images/punjabi.jpg', 'Traditional white panjabi with elegant design'),
('Banarasi Saree', 'Clothes', 17000.00, 15, '/Images/saree.jpg', 'Premium Banarasi silk saree'),
('Fashionable Tops', 'Clothes', 4000.00, 40, '/Images/tops.jpg', 'Trendy tops for women');

-- Health & Personal Care
INSERT INTO products (name, category, price, stock, image, description) VALUES
('CeraVe Hydrating Facial Cleanser', 'Health & Personal Care', 2500.00, 100, '/Images/ceraVe.jpg', 'Gentle cleanser for all skin types'),
('Dot & Key Vitamin C + E Sunscreen SPF 50+', 'Health & Personal Care', 1700.00, 80, '/Images/sunscreen.jpg', 'High protection sunscreen with vitamins'),
('Lux Body Wash French Rose & Almond', 'Health & Personal Care', 1800.00, 120, '/Images/bodywash.jpg', 'Luxurious body wash with rose fragrance');

-- Furniture
INSERT INTO products (name, category, price, stock, image, description) VALUES
('White Sofa', 'Furniture', 12000.00, 10, '/Images/sofa.jpg', 'Modern 3-seater white sofa'),
('Gaming Chair', 'Furniture', 7599.00, 25, '/Images/gaming-chair.jpg', 'Ergonomic gaming chair with lumbar support'),
('Computer Desk', 'Furniture', 17000.00, 15, '/Images/computer-desk.jpg', 'Spacious desk for home office'),
('Bed Room Set-1', 'Furniture', 17000.00, 8, '/Images/bed.jpg', 'Complete bedroom furniture set');

-- Electronics
INSERT INTO products (name, category, price, stock, image, description) VALUES
('Smart Watch', 'Electronics', 2998.00, 60, '/Images/smart-watch.png', 'Feature-rich smartwatch with fitness tracking'),
('Laptop Backpack', 'Electronics', 1599.00, 75, '/Images/backpack.jpg', 'Durable laptop backpack with multiple compartments'),
('Wireless Headphones', 'Electronics', 3599.00, 45, '/Images/Headphones.jpg', 'Premium wireless headphones with noise cancellation'),
('Bluetooth Speaker', 'Electronics', 7000.00, 35, '/Images/Bluetooth-Speaker.jpg', 'Portable Bluetooth speaker with deep bass');

-- Beauty Products
INSERT INTO products (name, category, price, stock, image, description) VALUES
('Wonderskin Wonder Blading All Day Lip Stain', 'Beauty', 799.00, 90, '/Images/Lip-Stain.jpg', 'Long-lasting lip stain peel-off masque'),
('LAURA GELLER Baked Palette', 'Beauty', 7599.00, 30, '/Images/GELLER.jpg', 'Professional makeup palette'),
('LAURA GELLER Jelly Balm Lip Balm', 'Beauty', 1700.00, 70, '/Images/Lip-Balm.jpg', 'Hydrating jelly lip balm'),
('LAURA GELLER Kabuki Brush', 'Beauty', 4000.00, 40, '/Images/Kabuki-Brush.jpg', 'Professional kabuki makeup brush');

-- Pet Care
INSERT INTO products (name, category, price, stock, image, description) VALUES
('Black Hawk Dog Food', 'Pet Care', 799.00, 100, '/Images/Dog_1.jpg', 'Premium nutrition for dogs'),
('Proline Cat Food', 'Pet Care', 599.00, 120, '/Images/cat_2.jpg', 'Balanced diet for cats'),
('Whiskas Cat Food', 'Pet Care', 1000.00, 110, '/Images/cat_1.jpg', 'Delicious meals for cats'),
('Purina One Dog Food', 'Pet Care', 400.00, 95, '/Images/Dog_2.jpg', 'Complete nutrition for dogs');

-- Toys
INSERT INTO products (name, category, price, stock, image, description) VALUES
('Yeonha Toys 60 Piece Mini Zoo Animal Set', 'Toys', 799.00, 50, '/Images/Toy1.jpg', 'Educational zoo animal toy collection'),
('30 Pack Squishy Toys Kawaii Party Favors', 'Toys', 7599.00, 40, '/Images/Toy2.jpg', 'Fun squishy toys for kids'),
('Toy Figures & Playsets', 'Toys', 17000.00, 20, '/Images/Toy3.jpg', 'Complete playset with multiple figures'),
('Marvel Avengers Action Figures Set of 5', 'Toys', 4000.00, 35, '/Images/Toy4.jpg', 'Collectible Marvel superhero figures');

-- Fashion Trends
INSERT INTO products (name, category, price, stock, image, description) VALUES
('Designer Blue Shirt', 'Fashion', 799.00, 45, '/Images/shirt.webp', 'Latest fashion trend blue shirt'),
('Premium White Panjabi', 'Fashion', 7599.00, 25, '/Images/punjabi.jpg', 'Fashionable traditional wear'),
('Luxury Banarasi Saree', 'Fashion', 17000.00, 12, '/Images/saree.jpg', 'High-end designer saree'),
('Trendy Fashion Tops', 'Fashion', 4000.00, 50, '/Images/tops.jpg', 'Latest collection of fashion tops');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

SELECT 'Database setup complete!' as Status;
SELECT COUNT(*) as total_products FROM products;
SELECT category, COUNT(*) as product_count FROM products GROUP BY category;