const express = require('express');
const { query } = require('express-validator');
const pool = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All report endpoints are admin-only
router.use(authMiddleware, adminOnly);

// ── GET /api/reports/sales ─────────────────────────────────────────────────────
// Aggregate sales by day / week / month in a date range
router.get('/sales',
  query('from').optional().isDate().withMessage('from must be YYYY-MM-DD'),
  query('to').optional().isDate().withMessage('to must be YYYY-MM-DD'),
  query('group_by').optional().isIn(['day', 'week', 'month']),
  validate,
  async (req, res) => {
    try {
      const {
        from     = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10),
        to       = new Date().toISOString().slice(0, 10),
        group_by = 'day',
      } = req.query;

      const groupExpr = {
        day:   "DATE(o.created_at)",
        week:  "DATE(DATE_SUB(o.created_at, INTERVAL WEEKDAY(o.created_at) DAY))",
        month: "DATE_FORMAT(o.created_at, '%Y-%m-01')",
      }[group_by];

      const [rows] = await pool.query(
        `SELECT
           ${groupExpr}            AS period,
           COUNT(*)                AS order_count,
           COALESCE(SUM(total),0)  AS revenue,
           COALESCE(SUM(discount),0) AS total_discount,
           COALESCE(SUM(tax),0)    AS total_tax,
           COALESCE(AVG(total),0)  AS avg_order_value
         FROM orders o
         WHERE DATE(o.created_at) BETWEEN ? AND ?
           AND o.payment_status = 'paid'
         GROUP BY period
         ORDER BY period ASC`,
        [from, to]
      );
      res.json({ from, to, group_by, data: rows });
    } catch (err) {
      console.error('[reports/sales]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── GET /api/reports/products ──────────────────────────────────────────────────
// Top/bottom selling products in date range
router.get('/products',
  query('from').optional().isDate(),
  query('to').optional().isDate(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['qty', 'revenue', 'profit']),
  validate,
  async (req, res) => {
    try {
      const {
        from  = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10),
        to    = new Date().toISOString().slice(0, 10),
        limit = 20,
        sort  = 'revenue',
      } = req.query;

      const sortCol = { qty: 'total_qty', revenue: 'revenue', profit: 'profit' }[sort] || 'revenue';

      const [rows] = await pool.query(
        `SELECT
           oi.product_id,
           oi.product_name,
           c.name                              AS category_name,
           SUM(oi.quantity)                    AS total_qty,
           SUM(oi.subtotal)                    AS revenue,
           MIN(oi.product_price)               AS min_price,
           MAX(oi.product_price)               AS max_price,
           COALESCE(
             SUM(oi.subtotal) - SUM(oi.quantity * COALESCE(p.cost_price, 0)), 0
           )                                   AS profit,
           p.stock                             AS current_stock
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE DATE(o.created_at) BETWEEN ? AND ?
           AND o.payment_status = 'paid'
         GROUP BY oi.product_id, oi.product_name
         ORDER BY ${sortCol} DESC
         LIMIT ?`,
        [from, to, parseInt(limit, 10)]
      );
      res.json({ from, to, sort, data: rows });
    } catch (err) {
      console.error('[reports/products]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── GET /api/reports/categories ───────────────────────────────────────────────
router.get('/categories',
  query('from').optional().isDate(),
  query('to').optional().isDate(),
  validate,
  async (req, res) => {
    try {
      const {
        from = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10),
        to   = new Date().toISOString().slice(0, 10),
      } = req.query;

      const [rows] = await pool.query(
        `SELECT
           c.id,
           c.name                              AS category_name,
           COUNT(DISTINCT oi.product_id)       AS products_sold,
           SUM(oi.quantity)                    AS total_qty,
           COALESCE(SUM(oi.subtotal), 0)       AS revenue
         FROM categories c
         LEFT JOIN products p ON c.id = p.category_id
         LEFT JOIN order_items oi ON p.id = oi.product_id
         LEFT JOIN orders o ON oi.order_id = o.id
           AND DATE(o.created_at) BETWEEN ? AND ?
           AND o.payment_status = 'paid'
         GROUP BY c.id
         ORDER BY revenue DESC`,
        [from, to]
      );
      res.json({ from, to, data: rows });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── GET /api/reports/cashiers ──────────────────────────────────────────────────
router.get('/cashiers',
  query('from').optional().isDate(),
  query('to').optional().isDate(),
  validate,
  async (req, res) => {
    try {
      const {
        from = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10),
        to   = new Date().toISOString().slice(0, 10),
      } = req.query;

      const [rows] = await pool.query(
        `SELECT
           u.id,
           u.name,
           u.email,
           COUNT(o.id)              AS order_count,
           COALESCE(SUM(o.total),0) AS revenue,
           COALESCE(AVG(o.total),0) AS avg_order_value,
           COUNT(CASE WHEN o.payment_method='cash'   THEN 1 END) AS cash_orders,
           COUNT(CASE WHEN o.payment_method='card'   THEN 1 END) AS card_orders,
           COUNT(CASE WHEN o.payment_method='upi'    THEN 1 END) AS upi_orders,
           COUNT(CASE WHEN o.payment_method='wallet' THEN 1 END) AS wallet_orders
         FROM users u
         LEFT JOIN orders o
           ON u.id = o.user_id
           AND DATE(o.created_at) BETWEEN ? AND ?
           AND o.payment_status = 'paid'
         WHERE u.role = 'cashier'
         GROUP BY u.id
         ORDER BY revenue DESC`,
        [from, to]
      );
      res.json({ from, to, data: rows });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── GET /api/reports/inventory ─────────────────────────────────────────────────
// Full inventory valuation report
router.get('/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.barcode,
         c.name                               AS category_name,
         p.unit,
         p.stock,
         p.price                              AS selling_price,
         p.cost_price,
         p.stock * p.cost_price               AS stock_value_cost,
         p.stock * p.price                    AS stock_value_retail,
         p.active,
         CASE
           WHEN p.stock = 0  THEN 'out_of_stock'
           WHEN p.stock <= 5 THEN 'critical'
           WHEN p.stock <= 10 THEN 'low'
           ELSE 'ok'
         END AS stock_status
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.stock ASC, p.name ASC`
    );

    const summary = {
      total_products:      rows.length,
      active_products:     rows.filter(r => r.active).length,
      out_of_stock:        rows.filter(r => r.stock_status === 'out_of_stock').length,
      critical_stock:      rows.filter(r => r.stock_status === 'critical').length,
      low_stock:           rows.filter(r => r.stock_status === 'low').length,
      total_stock_value:   rows.reduce((s, r) => s + Number(r.stock_value_cost), 0).toFixed(2),
      total_retail_value:  rows.reduce((s, r) => s + Number(r.stock_value_retail), 0).toFixed(2),
    };

    res.json({ summary, data: rows });
  } catch (err) {
    console.error('[reports/inventory]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/reports/payment-methods ──────────────────────────────────────────
router.get('/payment-methods',
  query('from').optional().isDate(),
  query('to').optional().isDate(),
  validate,
  async (req, res) => {
    try {
      const {
        from = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10),
        to   = new Date().toISOString().slice(0, 10),
      } = req.query;

      const [rows] = await pool.query(
        `SELECT
           payment_method,
           COUNT(*)               AS order_count,
           COALESCE(SUM(total),0) AS revenue,
           COALESCE(AVG(total),0) AS avg_order_value
         FROM orders
         WHERE DATE(created_at) BETWEEN ? AND ?
           AND payment_status = 'paid'
         GROUP BY payment_method
         ORDER BY revenue DESC`,
        [from, to]
      );
      res.json({ from, to, data: rows });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

module.exports = router;
