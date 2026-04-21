const express = require('express');
const { body, param, query } = require('express-validator');
const pool = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// ── GET /api/products ──────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, category_id, active, low_stock, sort = 'name', order = 'ASC' } = req.query;

    const allowedSort  = ['name', 'price', 'stock', 'created_at'];
    const allowedOrder = ['ASC', 'DESC'];
    const sortCol  = allowedSort.includes(sort)  ? sort  : 'name';
    const sortDir  = allowedOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    let sql = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.barcode LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      sql += ' AND p.category_id = ?';
      params.push(parseInt(category_id, 10));
    }
    if (active !== undefined) {
      sql += ' AND p.active = ?';
      params.push(active === 'true' || active === '1' ? 1 : 0);
    }
    if (low_stock === 'true') {
      sql += ' AND p.stock <= 10';
    }

    sql += ` ORDER BY p.${sortCol} ${sortDir}`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('[products/list]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/products/barcode/:barcode ─────────────────────────────────────────
// IMPORTANT: Must be defined BEFORE /:id to avoid route conflict
router.get('/barcode/:barcode', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.barcode = ? AND p.active = 1`,
      [req.params.barcode]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found for this barcode.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/products/:id ──────────────────────────────────────────────────────
router.get('/:id',
  authMiddleware,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Product not found.' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── POST /api/products ─────────────────────────────────────────────────────────
router.post('/',
  authMiddleware, adminOnly,
  body('name').trim().notEmpty().withMessage('Product name required.').isLength({ max: 200 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('cost_price').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stock').optional({ nullable: true }).isInt({ min: 0 }),
  body('category_id').optional({ nullable: true }).isInt({ min: 1 }),
  body('barcode').optional({ nullable: true }).isLength({ max: 100 }),
  body('unit').optional().isLength({ max: 50 }),
  validate,
  async (req, res) => {
    try {
      const { name, barcode, category_id, price, cost_price, stock, unit, image_url } = req.body;

      const [result] = await pool.query(
        `INSERT INTO products (name, barcode, category_id, price, cost_price, stock, unit, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          barcode || null,
          category_id || null,
          parseFloat(price),
          parseFloat(cost_price) || 0,
          parseInt(stock) || 0,
          unit || 'pcs',
          image_url || null,
        ]
      );
      res.status(201).json({ id: result.insertId, message: 'Product created.' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'A product with this barcode already exists.' });
      }
      console.error('[products/create]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── PUT /api/products/:id ──────────────────────────────────────────────────────
router.put('/:id',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  body('name').trim().notEmpty().withMessage('Product name required.').isLength({ max: 200 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('cost_price').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stock').optional({ nullable: true }).isInt({ min: 0 }),
  validate,
  async (req, res) => {
    try {
      const { name, barcode, category_id, price, cost_price, stock, unit, image_url, active } = req.body;
      const productId = parseInt(req.params.id, 10);

      const [result] = await pool.query(
        `UPDATE products
         SET name=?, barcode=?, category_id=?, price=?, cost_price=?, stock=?, unit=?, image_url=?, active=?
         WHERE id=?`,
        [
          name,
          barcode || null,
          category_id || null,
          parseFloat(price),
          parseFloat(cost_price) || 0,
          parseInt(stock) || 0,
          unit || 'pcs',
          image_url || null,
          active !== undefined ? (active ? 1 : 0) : 1,
          productId,
        ]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found.' });
      res.json({ message: 'Product updated.' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'A product with this barcode already exists.' });
      }
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── PATCH /api/products/:id/stock ──────────────────────────────────────────────
router.patch('/:id/stock',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
  body('adjustment').optional().isIn(['set', 'add', 'subtract']),
  validate,
  async (req, res) => {
    try {
      const productId = parseInt(req.params.id, 10);
      const { stock, adjustment = 'set', note } = req.body;
      const qty = parseInt(stock, 10);

      let sql;
      let params;
      if (adjustment === 'add') {
        sql = 'UPDATE products SET stock = stock + ? WHERE id = ?';
        params = [qty, productId];
      } else if (adjustment === 'subtract') {
        sql = 'UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?';
        params = [qty, productId];
      } else {
        sql = 'UPDATE products SET stock = ? WHERE id = ?';
        params = [qty, productId];
      }

      const [result] = await pool.query(sql, params);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found.' });

      // Fetch updated stock
      const [updated] = await pool.query('SELECT stock FROM products WHERE id = ?', [productId]);
      res.json({ message: 'Stock updated.', stock: updated[0].stock });
    } catch (err) {
      console.error('[products/stock]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── PATCH /api/products/:id/toggle-active ──────────────────────────────────────
router.patch('/:id/toggle-active',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const [result] = await pool.query(
        'UPDATE products SET active = NOT active WHERE id = ?',
        [req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found.' });
      const [updated] = await pool.query('SELECT active FROM products WHERE id = ?', [req.params.id]);
      res.json({ message: `Product ${updated[0].active ? 'activated' : 'deactivated'}.`, active: !!updated[0].active });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── DELETE /api/products/:id  (soft delete) ────────────────────────────────────
router.delete('/:id',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const [result] = await pool.query(
        'UPDATE products SET active = 0 WHERE id = ?',
        [req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found.' });
      res.json({ message: 'Product deactivated.' });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

module.exports = router;
