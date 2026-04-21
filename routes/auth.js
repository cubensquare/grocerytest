const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();
const SALT_ROUNDS = 12;

// ── POST /api/auth/login ───────────────────────────────────────────────────────
router.post('/login',
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password').notEmpty().withMessage('Password required.'),
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const [rows] = await pool.query(
        'SELECT * FROM users WHERE email = ? AND active = 1',
        [email]
      );
      if (!rows.length) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

      res.json({ token, user: payload });
    } catch (err) {
      console.error('[auth/login]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at, last_login FROM users WHERE id = ? AND active = 1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── POST /api/auth/change-password ────────────────────────────────────────────
router.post('/change-password',
  authMiddleware,
  body('current_password').notEmpty().withMessage('Current password required.'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
  validate,
  async (req, res) => {
    try {
      const { current_password, new_password } = req.body;

      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
      if (!rows.length) return res.status(404).json({ error: 'User not found.' });

      const valid = await bcrypt.compare(current_password, rows[0].password);
      if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });

      const hash = await bcrypt.hash(new_password, SALT_ROUNDS);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);

      res.json({ message: 'Password changed successfully.' });
    } catch (err) {
      console.error('[auth/change-password]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

module.exports = router;
