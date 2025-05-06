const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      console.log('No token provided:', {
        headers: req.headers,
        url: req.url,
      });
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', {
        userId: decoded.id,
        role: decoded.role,
      });
    } catch (jwtError) {
      console.error('Token verification error:', {
        message: jwtError.message,
        stack: jwtError.stack,
      });
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }

    // Fetch user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Validate role
    if (decoded.role !== user.role) {
      console.log('Role mismatch:', {
        tokenRole: decoded.role,
        userRole: user.role,
        userId: decoded.id,
      });
      return res.status(403).json({ message: 'Role mismatch, access denied' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
    });
    return res.status(500).json({ message: 'Server error in authentication', error: error.message });
  }
};

// Middleware for role-based access control
const role = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.log('Role access denied:', {
        userRole: req.user?.role,
        allowedRoles,
        userId: req.user?._id,
      });
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { protect, role };
