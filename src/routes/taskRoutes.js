const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');
const { protect, role } = require('../middlewares/auth');
const { check } = require('express-validator');

router.post(
  '/',
  protect,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('dueDate', 'Due date is required').isISO8601().toDate(),
    check('priority', 'Priority must be low, medium, or high').isIn(['low', 'medium', 'high']).optional(),
    check('status', 'Status must be todo, in-progress, or completed').isIn(['todo', 'in-progress', 'completed']).optional(),
    check('assignedTo', 'AssignedTo must be a valid user ID').optional().isMongoId(),
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
    check('title', 'Title is required').not().isEmpty().optional(),
    check('dueDate', 'Due date must be a valid date').isISO8601().toDate().optional(),
    check('priority', 'Priority must be low, medium, or high').isIn(['low', 'medium', 'high']).optional(),
    check('status', 'Status must be todo, in-progress, or completed').isIn(['todo', 'in-progress', 'completed']).optional(),
    check('assignedTo', 'AssignedTo must be a valid user ID').optional().isMongoId(),
  ],
  updateTask
);
router.delete('/:id', protect, deleteTask);

module.exports = router;