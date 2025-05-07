// server/routes/userRoutes.js
// const express = require('express')
// const router = express.Router()
// const { protect, role } = require('../middlewares/auth')
// const { getUsers, getUserById } = require('../controllers/userController')

// router.get('/', protect, role(['admin']), getUsers)
// router.get('/:id', protect, role(['admin']), getUserById)

// module.exports = router


const express = require('express');
const router = express.Router();
const { protect, role } = require('../middlewares/auth');
const { getUsers, getUserById, deleteUser } = require('../controllers/userController');

// Safe routing to catch undefined handlers
const safeRoute = (method, path, ...handlers) => {
  const validHandlers = handlers.filter(handler => {
    if (typeof handler !== 'function') {
      console.error(`Invalid handler for ${method} ${path}:`, handler);
      return false;
    }
    return true;
  });
  router[method.toLowerCase()](path, ...validHandlers);
};

// Routes
safeRoute('get', '/', protect, role(['admin']), getUsers);
safeRoute('get', '/:id', protect, role(['admin']), getUserById);
safeRoute('delete', '/:id', protect, role(['admin']), deleteUser);

module.exports = router;
