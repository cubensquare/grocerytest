/**
 * npm run db:seed
 * Inserts sample orders to populate the dashboard with realistic data.
 * Run AFTER npm run db:init.
 */
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(rand(8, 21), rand(0, 59), rand(0, 59));
  return d;
}

async function main() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'grocery_pos',
  });

  console.log('\n🌱  GroceryPOS — Seed Sample Orders\n');

  try {
    const [users]     = await conn.query("SELECT id FROM users WHERE role = 'cashier' OR role = 'admin'");
    const [products]  = await conn.query('SELECT id, name, price, stock FROM products WHERE active = 1');
    const [customers] = await conn.query('SELECT id FROM customers');
    const paymentMethods = ['cash', 'card', 'upi', 'wallet'];

    if (!products.length) {
      console.error('❌  No products found. Run npm run db:init first.');
      process.exit(1);
    }

    let ordersCreated = 0;

    for (let day = 30; day >= 0; day--) {
      const ordersPerDay = rand(5, 18);
      for (let i = 0; i < ordersPerDay; i++) {
        const orderDate = daysAgo(day);
        const itemCount = rand(1, 6);
        const items = [];
        const usedIds = new Set();

        for (let j = 0; j < itemCount; j++) {
          const p = pick(products);
          if (usedIds.has(p.id)) continue;
          usedIds.add(p.id);
          const qty = rand(1, 5);
          items.push({ product_id: p.id, name: p.name, price: p.price, quantity: qty });
        }
        if (!items.length) continue;

        const subtotal = items.reduce((s, it) => s + parseFloat(it.price) * it.quantity, 0);
        const discount = Math.random() < 0.15 ? rand(5, 50) : 0;
        const tax      = 0;
        const total    = Math.max(0, subtotal - discount + tax);
        const method   = pick(paymentMethods);
        const user     = pick(users);
        const customer = Math.random() < 0.4 ? pick(customers) : null;

        const orderNum = `INV-${orderDate.toISOString().slice(0,10).replace(/-/g,'')}-${rand(1000,9999)}`;

        const [orderRes] = await conn.query(
          `INSERT INTO orders
             (order_number, user_id, customer_id, subtotal, discount, tax, total,
              payment_method, payment_status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)`,
          [orderNum, user.id, customer?.id || null, subtotal, discount, tax, total, method, orderDate]
        );
        const orderId = orderRes.insertId;

        for (const it of items) {
          await conn.query(
            `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, it.product_id, it.name, it.price, it.quantity, parseFloat(it.price) * it.quantity]
          );
        }

        ordersCreated++;
      }
    }

    console.log(`✅  ${ordersCreated} sample orders inserted (last 30 days)`);
    console.log('\n🎉  Seed complete! Refresh the dashboard to see data.\n');
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
