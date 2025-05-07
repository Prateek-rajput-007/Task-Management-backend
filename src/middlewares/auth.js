// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//   let token;
//   console.log('Protect middleware: Checking token');
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     try {
//       token = req.headers.authorization.split(' ')[1];
//       console.log('Protect middleware: Token found:', token.substring(0, 10) + '...');
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log('Protect middleware: Token decoded:', decoded);
//       req.user = await User.findById(decoded.id).select('-password');
//       if (!req.user) {
//         console.error('Protect middleware: User not found for ID:', decoded.id);
//         return res.status(401).json({ message: 'User not found' });
//       }
//       console.log('Protect middleware: User set:', req.user._id);
//       next();
//     } catch (error) {
//       console.error('Protect middleware error:', {
//         message: error.message,
//         stack: error.stack,
//         token: token ? token.substring(0, 10) + '...' : 'none',
//         errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error))
//       });
//       res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
//     }
//   } else {
//     console.error('Protect middleware: No token provided');
//     res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// module.exports = protect;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  console.log('Protect middleware: Checking token', {
    authHeader: req.headers.authorization?.substring(0, 20) + '...'
  });
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Protect middleware: Token found:', token.substring(0, 10) + '...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Protect middleware: Token decoded:', {
        id: decoded.id,
        issued: new Date(decoded.iat * 1000).toISOString(),
        expires: new Date(decoded.exp * 1000).toISOString()
      });
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        console.error('Protect middleware: User not found for ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }
      console.log('Protect middleware: User set:', {
        userId: req.user._id,
        role: req.user.role
      });
      next();
    } catch (error) {
      console.error('Protect middleware error:', {
        message: error.message,
        stack: error.stack,
        token: token ? token.substring(0, 10) + '...' : 'none',
        errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
  } else {
    console.error('Protect middleware: No token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const role = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.error('Role middleware: Access denied', {
        userId: req.user?._id,
        userRole: req.user?.role,
        requiredRoles: roles
      });
      return res.status(403).json({ message: 'Access denied: Insufficient role' });
    }
    console.log('Role middleware: Access granted', {
      userId: req.user._id,
      userRole: req.user.role,
      requiredRoles: roles
    });
    next();
  };
};

module.exports = { protect, role };
