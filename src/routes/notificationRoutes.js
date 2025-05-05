const express = require('express');
const router = express.Router();
const { getNotifications, updateNotification } = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');
const { check } = require('express-validator');

router.get('/', protect, getNotifications);
router.put(
  '/:id',
  protect,
  [check('read', 'Read must be a boolean').isBoolean()],
  updateNotification
);

module.exports = router;