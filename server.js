const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security & Logging
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes('*')) {
      // Allow all origins
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' },
});
app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/customers',  require('./routes/customers'));
app.use('/api/reports',    require('./routes/reports'));

// Health check
app.get('/api/health', async (req, res) => {
  const pool = require('./config/db');
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS: origin not allowed.' });
  }
  console.error('[ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => {
  console.log(`🛒  GroceryPOS API  →  http://localhost:${PORT}`);
  console.log(`📋  ENV: ${process.env.NODE_ENV || 'development'}`);
});
