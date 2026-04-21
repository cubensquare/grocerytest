const jwt = require('jsonwebtoken');

/**
 * Verify JWT Bearer token.
 * Attaches decoded payload to req.user.
 */
const authMiddleware = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Allow only users with role = 'admin'.
 * Must be used AFTER authMiddleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin access required.' });
  }
  next();
};

/**
 * Allow admin OR the user themselves (for profile updates etc.)
 */
const adminOrSelf = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.id === parseInt(req.params.id, 10)) {
    return next();
  }
  res.status(403).json({ error: 'Forbidden: insufficient permissions.' });
};

module.exports = { authMiddleware, adminOnly, adminOrSelf };
