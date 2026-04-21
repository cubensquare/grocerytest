const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param } = require('express-validator');
const pool = require('../config/db');
const { authMiddleware, adminOnly, adminOrSelf } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
const SALT_ROUNDS = 12;

// ── GET /api/users ─────────────────────────────────────────────────────────────
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, active, created_at, last_login
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('[users/list]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/users/:id ─────────────────────────────────────────────────────────
router.get('/:id',
  authMiddleware, adminOrSelf,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, name, email, role, active, created_at, last_login FROM users WHERE id = ?',
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'User not found.' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── POST /api/users ────────────────────────────────────────────────────────────
router.post('/',
  authMiddleware, adminOnly,
  body('name').trim().notEmpty().withMessage('Name required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').optional().isIn(['admin', 'cashier']).withMessage('Role must be admin or cashier.'),
  validate,
  async (req, res) => {
    try {
      const { name, email, password, role = 'cashier' } = req.body;

      // Check duplicate email
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length) return res.status(409).json({ error: 'Email already in use.' });

      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hash, role]
      );

      res.status(201).json({ id: result.insertId, message: 'User created successfully.' });
    } catch (err) {
      console.error('[users/create]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── PUT /api/users/:id ─────────────────────────────────────────────────────────
router.put('/:id',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  body('name').trim().notEmpty().withMessage('Name required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('role').isIn(['admin', 'cashier']).withMessage('Role must be admin or cashier.'),
  body('active').isBoolean().withMessage('Active must be boolean.'),
  validate,
  async (req, res) => {
    try {
      const { name, email, role, active } = req.body;
      const userId = parseInt(req.params.id, 10);

      // Check email uniqueness (exclude self)
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]
      );
      if (existing.length) return res.status(409).json({ error: 'Email already in use.' });

      await pool.query(
        'UPDATE users SET name = ?, email = ?, role = ?, active = ? WHERE id = ?',
        [name, email, role, active ? 1 : 0, userId]
      );

      res.json({ message: 'User updated successfully.' });
    } catch (err) {
      console.error('[users/update]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── PATCH /api/users/:id/reset-password  (admin resets any user's password) ───
router.patch('/:id/reset-password',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  validate,
  async (req, res) => {
    try {
      const hash = await bcrypt.hash(req.body.new_password, SALT_ROUNDS);
      const [result] = await pool.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hash, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found.' });
      res.json({ message: 'Password reset successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── PATCH /api/users/:id/toggle-active ────────────────────────────────────────
router.patch('/:id/toggle-active',
  authMiddleware, adminOnly,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res) => {
    try {
      const userId = parseInt(req.params.id, 10);
      // Prevent admin from deactivating themselves
      if (userId === req.user.id) {
        return res.status(400).json({ error: 'Cannot deactivate your own account.' });
      }
      const [result] = await pool.query(
        'UPDATE users SET active = NOT active WHERE id = ?',
        [userId]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found.' });

      const [updated] = await pool.query('SELECT active FROM users WHERE id = ?', [userId]);
      res.json({
        message: `User ${updated[0].active ? 'activated' : 'deactivated'} successfully.`,
        active: !!updated[0].active,
      });
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

module.exports = router;
