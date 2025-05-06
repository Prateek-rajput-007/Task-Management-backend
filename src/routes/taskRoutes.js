const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { createTask, getTasks, getTask, updateTask, deleteTask, getTaskStats } = require('../controllers/taskController');
const { check, body } = require('express-validator');

router.post(
  '/',
  protect,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('dueDate', 'Due date is required').isISO8601().toDate(),
    check('priority', 'Priority must be low, medium, or high').optional().isIn(['low', 'medium', 'high']),
    check('status', 'Status must be todo, in-progress, or completed').optional().isIn(['todo', 'in-progress', 'completed']),
    body('assignedTo', 'AssignedTo must be a valid ObjectId or null').optional().custom((value) => {
      if (value === null || value === undefined) return true;
      return mongoose.isValidObjectId(value);
    }),
  ],
  createTask
);

router.get('/', protect, getTasks);

router.get('/stats', protect, getTaskStats);

router.get('/:id', protect, getTask);

router.put(
  '/:id',
  protect,
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('dueDate', 'Due date must be a valid date').optional().isISO8601().toDate(),
    check('priority', 'Priority must be low, medium, or high').optional().isIn(['low', 'medium', 'high']),
    check('status', 'Status must be todo, in-progress, or completed').optional().isIn(['todo', 'in-progress', 'completed']),
    body('assignedTo', 'AssignedTo must be a valid ObjectId or null').optional().custom((value) => {
      if (value === null || value === undefined) return true;
      return mongoose.isValidObjectId(value);
    }),
  ],
  updateTask
);

router.delete('/:id', protect, deleteTask);

module.exports = router;
