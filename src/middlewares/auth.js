const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (decoded.role !== user.role) {
      return res.status(403).json({ message: 'Role mismatch, access denied' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Token validation error:', error.message);
    }
    return res.status(401).json({ message: 'Not authorized, token verification failed' });
  }
};

// Middleware for role-based access control
const role = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { protect, role };
