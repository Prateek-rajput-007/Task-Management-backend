// const Task = require('../models/Task');
// const Notification = require('../models/Notification');
// const { validationResult } = require('express-validator');

// exports.createTask = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { title, description, dueDate, priority, status, assignedTo } = req.body;
//     const task = new Task({
//       title,
//       description,
//       dueDate,
//       priority: priority || 'medium',
//       status: status || 'todo',
//       createdBy: req.user.id,
//       assignedTo: req.user.role === 'admin' && assignedTo ? assignedTo : null,
//     });
//     const createdTask = await task.save();

//     if (assignedTo && assignedTo !== req.user.id && req.user.role === 'admin') {
//       const notification = new Notification({
//         user: assignedTo,
//         message: `You have been assigned a new task: ${title}`,
//         task: createdTask._id,
//       });
//       await notification.save();
//     }

//     res.status(201).json(createdTask);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getTasks = async (req, res) => {
//   try {
//     const { search, status, priority } = req.query;
//     const query = {};

//     if (req.user.role === 'user') {
//       query.$or = [{ createdBy: req.user.id }, { assignedTo: req.user.id }];
//     }

//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//       ];
//     }

//     if (status) query.status = status;
//     if (priority) query.priority = priority;

//     const tasks = await Task.find(query)
//       .populate('createdBy', 'name email')
//       .populate('assignedTo', 'name email')
//       .sort({ dueDate: 1 });

//     res.json(tasks);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id)
//       .populate('createdBy', 'name email')
//       .populate('assignedTo', 'name email');
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }
//     if (
//       req.user.role !== 'admin' &&
//       task.createdBy._id.toString() !== req.user.id &&
//       task.assignedTo?._id.toString() !== req.user.id
//     ) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     res.json(task);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.updateTask = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }
//     if (
//       req.user.role !== 'admin' &&
//       task.createdBy.toString() !== req.user.id
//     ) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     const { assignedTo, ...updates } = req.body;
//     if (req.user.role === 'admin' && assignedTo) {
//       updates.assignedTo = assignedTo;
//       if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
//         const notification = new Notification({
//           user: assignedTo,
//           message: `Task "${task.title}" has been reassigned to you`,
//           task: task._id,
//         });
//         await notification.save();
//       }
//     }
//     Object.assign(task, updates);
//     const updatedTask = await task.save();
//     res.json(updatedTask);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.deleteTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }
//     if (
//       req.user.role !== 'admin' &&
//       task.createdBy.toString() !== req.user.id
//     ) {
//       return res.status(403).json({ message: 'Access denied' });
//     }
//     await task.deleteOne();
//     res.json({ message: 'Task deleted' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.getTaskStats = async (req, res) => {
//   try {
//     const query = req.user.role === 'user'
//       ? { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] }
//       : {};
//     const tasks = await Task.find(query);
//     const stats = {
//       total: tasks.length,
//       completed: tasks.filter((t) => t.status === 'completed').length,
//       overdue: tasks.filter(
//         (t) => new Date(t.dueDate) < new Date() && t.status !== 'completed'
//       ).length,
//     };
//     res.json(stats);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Create task validation errors:', errors.array());
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    console.log('Creating task with data:', req.body);
    const task = new Task({
      title,
      description,
      dueDate,
      priority: priority || 'medium',
      status: status || 'todo',
      createdBy: req.user.id,
      assignedTo: req.user.role === 'admin' && assignedTo !== undefined ? assignedTo : null,
    });
    const createdTask = await task.save();

    if (assignedTo && assignedTo !== req.user.id && req.user.role === 'admin') {
      const notification = new Notification({
        user: assignedTo,
        message: `You have been assigned a new task: ${title}`,
        task: createdTask._id,
      });
      await notification.save();
    }

    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Create task error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    res.status(400).json({ message: error.message || 'Failed to create task' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { search, status, priority } = req.query;
    const query = {};

    if (req.user.role === 'user') {
      query.$or = [{ createdBy: req.user.id }, { assignedTo: req.user.id }];
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    console.log('Fetching tasks with query:', query);
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch tasks' });
  }
};

exports.getTask = async (req, res) => {
  try {
    console.log('Fetching task with ID:', req.params.id);
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (
      req.user.role !== 'admin' &&
      task.createdBy._id.toString() !== req.user.id &&
      task.assignedTo?._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch task' });
  }
};

exports.updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Update task validation errors:', errors.array());
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    console.log('Updating task with ID:', req.params.id, 'and data:', req.body);
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { assignedTo, ...updates } = req.body;
    if (req.user.role === 'admin' && assignedTo !== undefined) {
      updates.assignedTo = assignedTo;
      if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
        const notification = new Notification({
          user: assignedTo,
          message: `Task "${task.title}" has been reassigned to you`,
          task: task._id,
        });
        await notification.save();
      }
    }
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    res.status(400).json({ message: error.message || 'Failed to update task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    console.log('Deleting task with ID:', req.params.id);
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(400).json({ message: error.message || 'Failed to delete task' });
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const query = req.user.role === 'user'
      ? { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] }
      : {};
    console.log('Fetching task stats with query:', query);
    const tasks = await Task.find(query);
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter(
        (t) => new Date(t.dueDate) < new Date() && t.status !== 'completed'
      ).length,
    };
    res.json(stats);
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch task stats' });
  }
};
