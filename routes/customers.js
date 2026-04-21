const express = require('express');
const { body, param } = require('express-validator');
const pool = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// ── GET /api/customers ─────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, sort = 'name', order = 'ASC' } = req.query;
    const allowedSort  = ['name', 'loyalty_points', 'created_at'];
    const allowedOrder = ['ASC', 'DESC'];
    const sortCol = allowedSort.includes(sort)           ? sort           : 'name';
    const sortDir = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    let sql = `
      SELECT c.*,
             COUNT(o.id)              AS total_orders,
             COALESCE(SUM(o.total),0) AS total_spent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id AND o.payment_status = 'paid'
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` GROUP BY c.id ORDER BY c.${sortCol} ${sortDir}`;
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('[customers/list]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/customers/:id ─────────────────────────────────────────────────────
router.get('/:id',
  authMiddleware,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT c.*,
                COUNT(o.id)              AS total_orders,
                COALESCE(SUM(o.total),0) AS total_spent,
                MAX(o.created_at)        AS last_purchase
         FROM customers c
         LEFT JOIN orders o ON c.id = o.customer_id AND o.payment_status = 'paid'
         WHERE c.id = ?
         GROUP BY c.id`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Customer not found.' });

      // Last 5 orders
      const [orders] = await pool.query(
        `SELECT o.id, o.order_number, o.total, o.payment_method, o.created_at
         FROM orders o WHERE o.customer_id = ? ORDER BY o.created_at DESC LIMIT 5`,
        [req.params.id]
      );

      res.json({ ...rows[0], recent_orders: orders });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── POST /api/customers ────────────────────────────────────────────────────────
router.post('/',
  authMiddleware,
  body('name').trim().notEmpty().withMessage('Name required.').isLength({ max: 100 }),
  body('phone').optional({ nullable: true }).isMobilePhone().withMessage('Invalid phone number.'),
  body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
  validate,
  async (req, res) => {
    try {
      const { name, phone, email } = req.body;

      if (phone) {
        const [existing] = await pool.query('SELECT id FROM customers WHERE phone = ?', [phone]);
        if (existing.length) return res.status(409).json({ error: 'Phone number already registered.' });
      }

      const [result] = await pool.query(
        'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
        [name, phone || null, email || null]
      );
      res.status(201).json({ id: result.insertId, message: 'Customer created.' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Phone number already registered.' });
      console.error('[customers/create]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── PUT /api/customers/:id ─────────────────────────────────────────────────────
router.put('/:id',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  body('name').trim().notEmpty().withMessage('Name required.').isLength({ max: 100 }),
  body('phone').optional({ nullable: true }).isMobilePhone().withMessage('Invalid phone number.'),
  body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
  validate,
  async (req, res) => {
    try {
      const customerId = parseInt(req.params.id, 10);
      const { name, phone, email } = req.body;

      if (phone) {
        const [existing] = await pool.query(
          'SELECT id FROM customers WHERE phone = ? AND id != ?', [phone, customerId]
        );
        if (existing.length) return res.status(409).json({ error: 'Phone number already registered.' });
      }

      const [result] = await pool.query(
        'UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?',
        [name, phone || null, email || null, customerId]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found.' });
      res.json({ message: 'Customer updated.' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Phone number already registered.' });
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── PATCH /api/customers/:id/loyalty-points ────────────────────────────────────
router.patch('/:id/loyalty-points',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  body('points').isInt().withMessage('Points must be an integer.'),
  body('action').isIn(['add', 'subtract', 'set']).withMessage('Action must be add, subtract, or set.'),
  validate,
  async (req, res) => {
    try {
      const customerId = parseInt(req.params.id, 10);
      const { points, action } = req.body;
      const pts = parseInt(points, 10);

      let sql;
      if (action === 'add')      sql = 'UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?';
      else if (action === 'subtract') sql = 'UPDATE customers SET loyalty_points = GREATEST(0, loyalty_points - ?) WHERE id = ?';
      else                       sql = 'UPDATE customers SET loyalty_points = ? WHERE id = ?';

      const [result] = await pool.query(sql, [pts, customerId]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found.' });

      const [updated] = await pool.query('SELECT loyalty_points FROM customers WHERE id = ?', [customerId]);
      res.json({ message: 'Loyalty points updated.', loyalty_points: updated[0].loyalty_points });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── DELETE /api/customers/:id ──────────────────────────────────────────────────
router.delete('/:id',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      // Soft delete: nullify customer on orders, then delete record
      const customerId = parseInt(req.params.id, 10);
      await pool.query('UPDATE orders SET customer_id = NULL WHERE customer_id = ?', [customerId]);
      const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [customerId]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found.' });
      res.json({ message: 'Customer deleted.' });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

module.exports = router;
