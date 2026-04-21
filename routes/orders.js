const express = require('express');
const { body, param, query } = require('express-validator');
const pool = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// ── Helper: generate order number ─────────────────────────────────────────────
const generateOrderNumber = () => {
  const d = new Date();
  const date = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${date}-${rand}`;
};

// ── GET /api/orders/stats/dashboard ───────────────────────────────────────────
// MUST be before /:id so Express doesn't treat "stats" as an id
router.get('/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    const [[todaySales]] = await pool.query(
      `SELECT COUNT(*) AS order_count, COALESCE(SUM(total), 0) AS revenue
       FROM orders WHERE DATE(created_at) = CURDATE() AND payment_status = 'paid'`
    );
    const [[monthlySales]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS order_count
       FROM orders
       WHERE MONTH(created_at) = MONTH(CURDATE())
         AND YEAR(created_at)  = YEAR(CURDATE())
         AND payment_status = 'paid'`
    );
    const [[yearlySales]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS order_count
       FROM orders WHERE YEAR(created_at) = YEAR(CURDATE()) AND payment_status = 'paid'`
    );
    const [topProducts] = await pool.query(
      `SELECT oi.product_name, SUM(oi.quantity) AS total_qty, SUM(oi.subtotal) AS revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE DATE(o.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         AND o.payment_status = 'paid'
       GROUP BY oi.product_name
       ORDER BY total_qty DESC LIMIT 5`
    );
    const [lowStock] = await pool.query(
      `SELECT id, name, stock, unit FROM products
       WHERE stock <= 10 AND active = 1 ORDER BY stock ASC LIMIT 10`
    );
    const [recentOrders] = await pool.query(
      `SELECT o.*, u.name AS cashier_name, c.name AS customer_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       LEFT JOIN customers c ON o.customer_id = c.id
       ORDER BY o.created_at DESC LIMIT 5`
    );
    const [weeklyData] = await pool.query(
      `SELECT DATE(created_at) AS date,
              COUNT(*) AS orders,
              COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND payment_status = 'paid'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );
    const [paymentBreakdown] = await pool.query(
      `SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE MONTH(created_at) = MONTH(CURDATE()) AND payment_status = 'paid'
       GROUP BY payment_method`
    );
    const [hourlyData] = await pool.query(
      `SELECT HOUR(created_at) AS hour, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE DATE(created_at) = CURDATE() AND payment_status = 'paid'
       GROUP BY HOUR(created_at)
       ORDER BY hour ASC`
    );

    res.json({
      today: todaySales,
      monthly: monthlySales,
      yearly: yearlySales,
      topProducts,
      lowStock,
      recentOrders,
      weeklyData,
      paymentBreakdown,
      hourlyData,
    });
  } catch (err) {
    console.error('[orders/stats/dashboard]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/orders ────────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      from, to,
      payment_method,
      payment_status,
      customer_id,
      cashier_id,
      limit  = 50,
      offset = 0,
    } = req.query;

    let sql = `
      SELECT o.*, u.name AS cashier_name, c.name AS customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (from)           { sql += ' AND DATE(o.created_at) >= ?';    params.push(from); }
    if (to)             { sql += ' AND DATE(o.created_at) <= ?';    params.push(to); }
    if (payment_method) { sql += ' AND o.payment_method = ?';       params.push(payment_method); }
    if (payment_status) { sql += ' AND o.payment_status = ?';       params.push(payment_status); }
    if (customer_id)    { sql += ' AND o.customer_id = ?';          params.push(parseInt(customer_id, 10)); }
    if (cashier_id)     { sql += ' AND o.user_id = ?';              params.push(parseInt(cashier_id, 10)); }

    // Cashiers can only see their own orders
    if (req.user.role === 'cashier') {
      sql += ' AND o.user_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('[orders/list]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/orders/:id ────────────────────────────────────────────────────────
router.get('/:id',
  authMiddleware,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const [orders] = await pool.query(
        `SELECT o.*, u.name AS cashier_name, c.name AS customer_name
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         LEFT JOIN customers c ON o.customer_id = c.id
         WHERE o.id = ?`,
        [req.params.id]
      );
      if (!orders.length) return res.status(404).json({ error: 'Order not found.' });

      // Cashier can only see their own orders
      if (req.user.role === 'cashier' && orders[0].user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied.' });
      }

      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC',
        [req.params.id]
      );

      res.json({ ...orders[0], items });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── POST /api/orders ───────────────────────────────────────────────────────────
router.post('/',
  authMiddleware,
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item.'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Invalid product_id.'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be non-negative.'),
  body('items.*.name').notEmpty().withMessage('Item name required.'),
  body('discount').optional().isFloat({ min: 0 }),
  body('tax').optional().isFloat({ min: 0 }),
  body('payment_method').optional().isIn(['cash', 'card', 'upi', 'wallet']),
  body('customer_id').optional({ nullable: true }).isInt({ min: 1 }),
  validate,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const {
        customer_id  = null,
        items,
        discount     = 0,
        tax          = 0,
        payment_method = 'cash',
        notes        = null,
      } = req.body;

      // Validate stock for each item
      for (const item of items) {
        const [rows] = await conn.query(
          'SELECT id, name, stock, active FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );
        if (!rows.length || !rows[0].active) {
          await conn.rollback();
          return res.status(400).json({ error: `Product #${item.product_id} not found or inactive.` });
        }
        if (rows[0].stock < item.quantity) {
          await conn.rollback();
          return res.status(400).json({
            error: `Insufficient stock for "${rows[0].name}". Available: ${rows[0].stock}.`
          });
        }
      }

      // Calculate totals
      const subtotal = items.reduce((s, i) => s + parseFloat(i.price) * parseInt(i.quantity, 10), 0);
      const total    = Math.max(0, subtotal - parseFloat(discount) + parseFloat(tax));

      // Generate unique order number (retry on collision)
      let orderNumber;
      let attempts = 0;
      do {
        orderNumber = generateOrderNumber();
        const [exists] = await conn.query('SELECT id FROM orders WHERE order_number = ?', [orderNumber]);
        if (!exists.length) break;
        attempts++;
      } while (attempts < 5);

      // Insert order
      const [orderResult] = await conn.query(
        `INSERT INTO orders
           (order_number, user_id, customer_id, subtotal, discount, tax, total, payment_method, payment_status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)`,
        [orderNumber, req.user.id, customer_id, subtotal, discount, tax, total, payment_method, notes]
      );
      const orderId = orderResult.insertId;

      // Insert items and deduct stock
      for (const item of items) {
        const lineSubtotal = parseFloat(item.price) * parseInt(item.quantity, 10);
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.name, parseFloat(item.price), parseInt(item.quantity, 10), lineSubtotal]
        );
        await conn.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [parseInt(item.quantity, 10), item.product_id]
        );
      }

      // Loyalty points: 1 point per ₹10 spent
      if (customer_id) {
        const points = Math.floor(total / 10);
        if (points > 0) {
          await conn.query(
            'UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?',
            [points, customer_id]
          );
        }
      }

      await conn.commit();
      res.status(201).json({
        id: orderId,
        order_number: orderNumber,
        subtotal,
        discount,
        tax,
        total,
        message: 'Order created successfully.',
      });
    } catch (err) {
      await conn.rollback();
      console.error('[orders/create]', err);
      res.status(500).json({ error: 'Server error.' });
    } finally {
      conn.release();
    }
  }
);

// ── POST /api/orders/:id/refund ────────────────────────────────────────────────
router.post('/:id/refund',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  body('reason').optional().trim().isLength({ max: 500 }),
  validate,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const orderId = parseInt(req.params.id, 10);
      const [orders] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);

      if (!orders.length) {
        await conn.rollback();
        return res.status(404).json({ error: 'Order not found.' });
      }
      if (orders[0].payment_status === 'refunded') {
        await conn.rollback();
        return res.status(400).json({ error: 'Order already refunded.' });
      }

      // Mark as refunded
      await conn.query(
        `UPDATE orders SET payment_status = 'refunded',
         notes = CONCAT(COALESCE(notes, ''), ' | REFUNDED: ', ?)
         WHERE id = ?`,
        [req.body.reason || 'No reason provided', orderId]
      );

      // Restore stock
      const [items] = await conn.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL',
        [orderId]
      );
      for (const item of items) {
        await conn.query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Deduct loyalty points if applicable
      if (orders[0].customer_id) {
        const pointsEarned = Math.floor(orders[0].total / 10);
        await conn.query(
          'UPDATE customers SET loyalty_points = GREATEST(0, loyalty_points - ?) WHERE id = ?',
          [pointsEarned, orders[0].customer_id]
        );
      }

      await conn.commit();
      res.json({ message: 'Order refunded successfully. Stock has been restored.' });
    } catch (err) {
      await conn.rollback();
      console.error('[orders/refund]', err);
      res.status(500).json({ error: 'Server error.' });
    } finally {
      conn.release();
    }
  }
);

module.exports = router;
