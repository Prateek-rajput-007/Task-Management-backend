// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { validationResult } = require('express-validator');

// // Register User
// exports.register = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { name, email, password, role } = req.body;
//   try {
//     const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists with this email' });
//     }

//     const user = new User({ name, email: email.trim().toLowerCase(), password, role });
//     await user.save();


//     const payload = { id: user._id, role: user.role };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

//     res.status(201).json({
//       message: 'User registered successfully',
//       token,
//       user: { id: user._id, name, email: user.email, role }
//     });
//   } catch (error) {
//     console.error('Register error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Login User
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       console.error(`Login attempt: { email: '${email}', userFound: false }`);
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }


//     // Check if password matches
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       console.error(`Login attempt: { email: '${email}', userFound: true, passwordMatch: false }`);
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     console.log(`Login attempt: { email: '${email}', userFound: true, passwordMatch: true }`);

//     // Generate token with user ID and role
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     res.status(200).json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error('Login error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get Current Authenticated User
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });
//   } catch (error) {
//     console.error('GetMe error:', error.message);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Register User
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Register validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      console.error('Register error: User already exists', { email });
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({ name, email: email.trim().toLowerCase(), password, role });
    await user.save();

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    console.log('User registered:', user._id);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name, email: user.email, role }
    });
  } catch (error) {
    console.error('Register error:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login User
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      console.error(`Login attempt: { email: '${email}', userFound: false }`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.error(`Login attempt: { email: '${email}', userFound: true, passwordMatch: false }`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`Login attempt: { email: '${email}', userFound: true, passwordMatch: true }`);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Current Authenticated User
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.error('GetMe error: User not found', { userId: req.user.id });
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User fetched:', user._id);
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('GetMe error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getMe };
