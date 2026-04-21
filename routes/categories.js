const express = require('express');
const { body, param } = require('express-validator');
const pool = require('../config/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// ── GET /api/categories ────────────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id, c.name, c.description, c.created_at,
        COUNT(p.id) AS product_count,
        SUM(CASE WHEN p.active = 1 THEN 1 ELSE 0 END) AS active_product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('[categories/list]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/categories/:id ────────────────────────────────────────────────────
router.get('/:id',
  authMiddleware,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT c.*, COUNT(p.id) AS product_count
         FROM categories c
         LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
         WHERE c.id = ? GROUP BY c.id`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Category not found.' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── POST /api/categories ───────────────────────────────────────────────────────
router.post('/',
  authMiddleware, adminOnly,
  body('name').trim().notEmpty().withMessage('Category name required.').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  validate,
  async (req, res) => {
    try {
      const { name, description } = req.body;

      // Check duplicate name
      const [existing] = await pool.query('SELECT id FROM categories WHERE name = ?', [name]);
      if (existing.length) return res.status(409).json({ error: 'Category name already exists.' });

      const [result] = await pool.query(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description || null]
      );
      res.status(201).json({ id: result.insertId, message: 'Category created.' });
    } catch (err) {
      console.error('[categories/create]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── PUT /api/categories/:id ────────────────────────────────────────────────────
router.put('/:id',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  body('name').trim().notEmpty().withMessage('Category name required.').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  validate,
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const catId = parseInt(req.params.id, 10);

      // Check duplicate name (exclude self)
      const [existing] = await pool.query(
        'SELECT id FROM categories WHERE name = ? AND id != ?', [name, catId]
      );
      if (existing.length) return res.status(409).json({ error: 'Category name already exists.' });

      const [result] = await pool.query(
        'UPDATE categories SET name = ?, description = ? WHERE id = ?',
        [name, description || null, catId]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found.' });
      res.json({ message: 'Category updated.' });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── DELETE /api/categories/:id ─────────────────────────────────────────────────
router.delete('/:id',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const catId = parseInt(req.params.id, 10);

      // Prevent deleting if it has products
      const [products] = await pool.query(
        'SELECT COUNT(*) AS cnt FROM products WHERE category_id = ?', [catId]
      );
      if (products[0].cnt > 0) {
        return res.status(409).json({
          error: `Cannot delete: ${products[0].cnt} product(s) belong to this category. Reassign them first.`
        });
      }

      const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [catId]);
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found.' });
      res.json({ message: 'Category deleted.' });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

module.exports = router;
