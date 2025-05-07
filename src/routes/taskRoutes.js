// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middlewares/auth');
// const { getTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/taskController');
// const { check, body, validationResult } = require('express-validator');
// const mongoose = require('mongoose');

// const logRequestBody = (req, res, next) => {
//   console.log('Raw request body:', JSON.stringify(req.body, null, 2));
//   next();
// };

// const sanitizePriority = (value) => {
//   const validPriorities = ['low', 'medium', 'high'];
//   return validPriorities.includes(value) ? value : 'medium';
// };

// router.get('/', protect, getTasks);
// router.get('/:id', protect, getTask);

// router.post(
//   '/',
//   protect,
//   logRequestBody,
//   [
//     check('title', 'Title is required').not().isEmpty(),
//     check('dueDate', 'Due date must be a valid date').isISO8601().toDate(),
//     check('priority').optional().customSanitizer(sanitizePriority),
//     check('status', 'Status must be todo, in-progress, or completed').optional().isIn(['todo', 'in-progress', 'completed']),
//     body('assignedTo', 'AssignedTo must be a valid ObjectId or null').optional().custom((value) => {
//       if (value === null || value === undefined) return true;
//       return mongoose.isValidObjectId(value);
//     }),
//   ],
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
//       return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
//     }
//     next();
//   },
//   createTask
// );

// router.put(
//   '/:id',
//   protect,
//   logRequestBody,
//   [
//     check('title', 'Title is required').optional().not().isEmpty(),
//     check('dueDate', 'Due date must be a valid date').optional().isISO8601().toDate(),
//     check('priority').optional().customSanitizer(sanitizePriority),
//     check('status', 'Status must be todo, in-progress, or completed').optional().isIn(['todo', 'in-progress', 'completed']),
//     body('assignedTo', 'AssignedTo must be a valid ObjectId or null').optional().custom((value) => {
//       if (value === null || value === undefined) return true;
//       return mongoose.isValidObjectId(value);
//     }),
//   ],
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
//       return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
//     }
//     next();
//   },
//   updateTask
// );

// router.delete('/:id', protect, deleteTask);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats } = require('../controllers/taskController');
const { check, body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const logRequestBody = (req, res, next) => {
  console.log('Raw request body:', JSON.stringify(req.body, null, 2));
  next();
};

const sanitizePriority = (value) => {
  const validPriorities = ['low', 'medium', 'high'];
  return validPriorities.includes(value) ? value : 'medium';
};

router.get('/', protect, getTasks);
router.get('/:id', protect, getTask);
router.get('/stats', protect, getTaskStats);

router.post(
  '/',
  protect,
  logRequestBody,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('dueDate', 'Due date must be a valid date').isISO8601().toDate(),
    check('priority').optional().customSanitizer(sanitizePriority),
    check('status', 'Status must be todo, in-progress, or completed').optional().isIn(['todo', 'in-progress', 'completed']),
    body('assignedTo', 'AssignedTo must be a valid ObjectId or null').optional().custom((value) => {
      if (value === null || value === undefined) return true;
      return mongoose.isValidObjectId(value);
    }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
  },
  createTask
);

router.put(
  '/:id',
  protect,
  logRequestBody,
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('dueDate', 'Due date must be a valid date').optional().isISO8601().toDate(),
    check('priority').optional().customSanitizer(sanitizePriority),
    check('status', 'Status must be todo, in-progress, or completed').optional().isIn(['todo', 'in-progress', 'completed']),
    body('assignedTo', 'AssignedTo must be a valid ObjectId or null').optional().custom((value) => {
      if (value === null || value === undefined) return true;
      return mongoose.isValidObjectId(value);
    }),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
  },
  updateTask
);

router.delete('/:id', protect, deleteTask);

module.exports = router;
