/**
 * npm run db:init
 * Creates the database, all tables, and seeds data programmatically.
 * Safe to re-run: uses CREATE TABLE IF NOT EXISTS and INSERT IGNORE.
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function main() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const DB = process.env.DB_NAME || 'grocery_pos';
  console.log(`\n🛒  GroceryPOS — Database Initialiser`);
  console.log(`📍  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`🗄️   Database: ${DB}\n`);

  try {
    // Create DB
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${DB}\``);
    console.log('✅  Database ready');

    // ── Tables ──────────────────────────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(100)  NOT NULL,
        email      VARCHAR(100)  NOT NULL UNIQUE,
        password   VARCHAR(255)  NOT NULL,
        role       ENUM('admin','cashier') DEFAULT 'cashier',
        active     TINYINT(1)    DEFAULT 1,
        last_login TIMESTAMP     NULL,
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(200)   NOT NULL,
        barcode     VARCHAR(100)   UNIQUE,
        category_id INT,
        price       DECIMAL(10,2)  NOT NULL,
        cost_price  DECIMAL(10,2)  DEFAULT 0,
        stock       INT            DEFAULT 0,
        unit        VARCHAR(50)    DEFAULT 'pcs',
        image_url   VARCHAR(500),
        active      TINYINT(1)     DEFAULT 1,
        created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        name           VARCHAR(100) NOT NULL,
        phone          VARCHAR(20)  UNIQUE,
        email          VARCHAR(100),
        loyalty_points INT          DEFAULT 0,
        created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        order_number   VARCHAR(50)  NOT NULL UNIQUE,
        user_id        INT,
        customer_id    INT,
        subtotal       DECIMAL(10,2) NOT NULL,
        discount       DECIMAL(10,2) DEFAULT 0,
        tax            DECIMAL(10,2) DEFAULT 0,
        total          DECIMAL(10,2) NOT NULL,
        payment_method ENUM('cash','card','upi','wallet') DEFAULT 'cash',
        payment_status ENUM('paid','pending','refunded')  DEFAULT 'paid',
        notes          TEXT,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB`);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        order_id      INT           NOT NULL,
        product_id    INT,
        product_name  VARCHAR(200)  NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity      INT           NOT NULL,
        subtotal      DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
      ) ENGINE=InnoDB`);

    console.log('✅  All tables created');

    // ── Seed Users ───────────────────────────────────────────────────────────
    const adminHash    = await bcrypt.hash('password', 12);
    const cashierHash  = await bcrypt.hash('cashier123', 12);

    await conn.query(`
      INSERT IGNORE INTO users (name, email, password, role) VALUES
      ('Admin User',   'admin@grocerypos.com',   ?, 'admin'),
      ('John Cashier', 'cashier@grocerypos.com', ?, 'cashier')
    `, [adminHash, cashierHash]);
    console.log('✅  Users seeded   (admin: password | cashier: cashier123)');

    // ── Seed Categories ───────────────────────────────────────────────────────
    await conn.query(`
      INSERT IGNORE INTO categories (name, description) VALUES
      ('Fruits & Vegetables', 'Fresh fruits and vegetables'),
      ('Dairy & Eggs',        'Milk, cheese, butter, eggs'),
      ('Bakery',              'Breads, cakes, pastries'),
      ('Beverages',           'Juices, water, sodas, tea, coffee'),
      ('Snacks',              'Chips, biscuits, namkeen'),
      ('Grains & Pulses',     'Rice, wheat, dal, pulses'),
      ('Meat & Seafood',      'Fresh meat, fish, chicken'),
      ('Personal Care',       'Soap, shampoo, toothpaste'),
      ('Household',           'Cleaning products, detergent'),
      ('Frozen Foods',        'Frozen vegetables, ready meals')
    `);
    console.log('✅  Categories seeded');

    // ── Seed Products ─────────────────────────────────────────────────────────
    // Look up category IDs by name so order doesn't matter
    const [cats] = await conn.query('SELECT id, name FROM categories');
    const catMap = Object.fromEntries(cats.map(c => [c.name, c.id]));

    const products = [
      ['Basmati Rice (1kg)',       '8901234567890', catMap['Grains & Pulses'],     85.00, 65.00, 150, 'kg'],
      ['Whole Wheat Atta (5kg)',   '8901234567891', catMap['Grains & Pulses'],    220.00,175.00,  80, 'pack'],
      ['Amul Butter (500g)',       '8901234567892', catMap['Dairy & Eggs'],       245.00,200.00,  60, 'pack'],
      ['Amul Milk (1L)',           '8901234567893', catMap['Dairy & Eggs'],        62.00, 50.00, 200, 'litre'],
      ['Eggs (12 pcs)',            '8901234567894', catMap['Dairy & Eggs'],        90.00, 72.00, 100, 'dozen'],
      ['Tomatoes',                 '8901234567895', catMap['Fruits & Vegetables'], 40.00, 25.00, 200, 'kg'],
      ['Onions',                   '8901234567896', catMap['Fruits & Vegetables'], 35.00, 20.00, 250, 'kg'],
      ['Potatoes',                 '8901234567897', catMap['Fruits & Vegetables'], 30.00, 18.00, 300, 'kg'],
      ['Bananas (dozen)',          '8901234567898', catMap['Fruits & Vegetables'], 45.00, 30.00, 100, 'dozen'],
      ['Apples (1kg)',             '8901234567899', catMap['Fruits & Vegetables'],180.00,140.00,  80, 'kg'],
      ['Britannia Bread',          '8901234567900', catMap['Bakery'],              45.00, 35.00, 120, 'pack'],
      ["Parle-G Biscuits",         '8901234567901', catMap['Snacks'],              10.00,  8.00, 500, 'pack'],
      ["Lay's Classic Chips",      '8901234567902', catMap['Snacks'],              20.00, 15.00, 300, 'pack'],
      ['Coca-Cola (500ml)',         '8901234567903', catMap['Beverages'],           40.00, 30.00, 200, 'bottle'],
      ['Mineral Water (1L)',        '8901234567904', catMap['Beverages'],           20.00, 12.00, 400, 'bottle'],
      ['Tata Tea Premium (250g)',   '8901234567905', catMap['Beverages'],          140.00,110.00,  90, 'pack'],
      ['Nescafe Classic (100g)',    '8901234567906', catMap['Beverages'],          250.00,200.00,  50, 'jar'],
      ['Toor Dal (1kg)',            '8901234567907', catMap['Grains & Pulses'],    130.00,100.00, 120, 'kg'],
      ['Sunflower Oil (1L)',        '8901234567908', catMap['Grains & Pulses'],    130.00,105.00, 100, 'litre'],
      ['Colgate Toothpaste (200g)', '8901234567909', catMap['Personal Care'],      95.00, 75.00,  80, 'tube'],
      ['Dove Soap (75g)',           '8901234567910', catMap['Personal Care'],       50.00, 38.00, 150, 'bar'],
      ['Surf Excel (1kg)',          '8901234567911', catMap['Household'],          210.00,165.00,  70, 'pack'],
      ['Chicken Breast (1kg)',      '8901234567912', catMap['Meat & Seafood'],     280.00,220.00,  40, 'kg'],
      ['Frozen Peas (500g)',        '8901234567913', catMap['Frozen Foods'],        70.00, 55.00,  60, 'pack'],
      ['Maggi Noodles (280g)',      '8901234567914', catMap['Snacks'],              52.00, 42.00, 200, 'pack'],
    ];

    for (const [name, barcode, category_id, price, cost_price, stock, unit] of products) {
      await conn.query(
        `INSERT IGNORE INTO products (name, barcode, category_id, price, cost_price, stock, unit)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, barcode, category_id, price, cost_price, stock, unit]
      );
    }
    console.log('✅  Products seeded  (25 products)');

    // ── Seed Customers ────────────────────────────────────────────────────────
    await conn.query(`
      INSERT IGNORE INTO customers (name, phone, email, loyalty_points) VALUES
      ('Priya Sharma', '9876543210', 'priya@example.com',  250),
      ('Rahul Verma',  '9876543211', 'rahul@example.com',  120),
      ('Anita Singh',  '9876543212', 'anita@example.com',  500),
      ('Dev Patel',    '9876543213', 'dev@example.com',     75)
    `);
    console.log('✅  Customers seeded');

    console.log('\n🎉  Database initialised successfully!\n');
    console.log('   Admin login:   admin@grocerypos.com  /  password');
    console.log('   Cashier login: cashier@grocerypos.com / cashier123\n');
  } catch (err) {
    console.error('\n❌  Init failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
