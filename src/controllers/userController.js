// server/controllers/userController.js
// const User = require('../models/User')

// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find().select('-password')
//     res.json(users)
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' })
//   }
// }

// exports.getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password')
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' })
//     }
//     res.json(user)
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' })
//   }
// }

const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    console.log('Fetched users:', users.length);
    res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error while fetching users', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      console.error('Get user by ID: User not found', { userId: req.params.id });
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Fetched user:', user._id);
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user by ID error:', {
      message: error.message,
      stack: error.stack,
      userId: req.params.id
    });
    res.status(500).json({ message: 'Server error while fetching user', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.error('Delete user: User not found', { userId: req.params.id });
      return res.status(404).json({ message: 'User not found' });
    }
    await user.remove();
    console.log('Deleted user:', user._id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', {
      message: error.message,
      stack: error.stack,
      userId: req.params.id
    });
    res.status(500).json({ message: 'Server error while deleting user', error: error.message });
  }
};

console.log('Exporting userController functions:', {
  getUsers: typeof getUsers,
  getUserById: typeof getUserById,
  deleteUser: typeof deleteUser
});

module.exports = { getUsers, getUserById, deleteUser };
