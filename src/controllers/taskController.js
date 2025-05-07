
// const Task = require('../models/Task');
// const Notification = require('../models/Notification');
// const { validationResult } = require('express-validator');

// exports.createTask = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
//   }

//   try {
//     const { title, description, dueDate, priority, status, assignedTo } = req.body;
//     console.log('Creating task with data:', { title, dueDate, assignedTo, userId: req.user.id }); // Debug log
//     const task = new Task({
//       title,
//       description,
//       dueDate,
//       priority: priority || 'medium',
//       status: status || 'todo',
//       createdBy: req.user.id,
//       assignedTo: req.user.role === 'admin' && assignedTo !== undefined ? assignedTo : null,
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
//     console.error('Create task error:', error);
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: 'Validation failed', errors: messages });
//     }
//     res.status(400).json({ message: error.message || 'Failed to create task' });
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

//     console.log('Fetching tasks with query:', query); // Debug log
//     const tasks = await Task.find(query)
//       .populate('createdBy', 'name email')
//       .populate('assignedTo', 'name email')
//       .sort({ dueDate: 1 });

//     res.json(tasks);
//   } catch (error) {
//     console.error('Get tasks error:', error);
//     res.status(500).json({ message: error.message || 'Failed to fetch tasks' });
//   }
// };

// exports.getTask = async (req, res) => {
//   try {
//     console.log('Fetching task with ID:', req.params.id); // Debug log
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
//     console.error('Get task error:', error);
//     res.status(500).json({ message: error.message || 'Failed to fetch task' });
//   }
// };

// exports.updateTask = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
//   }

//   try {
//     console.log('Updating task with ID:', req.params.id, 'and data:', req.body); // Debug log
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
//     if (req.user.role === 'admin' && assignedTo !== undefined) {
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
//     const updatedTask = await Task.findByIdAndUpdate(
//       req.params.id,
//       { $set: updates },
//       { new: true, runValidators: true }
//     );
//     if (!updatedTask) {
//       return res.status(404).json({ message: 'Task not found' });
//     }
//     res.json(updatedTask);
//   } catch (error) {
//     console.error('Update task error:', error);
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ message: 'Validation failed', errors: messages });
//     }
//     res.status(400).json({ message: error.message || 'Failed to update task' });
//   }
// };

// exports.deleteTask = async (req, res) => {
//   try {
//     console.log('Deleting task with ID:', req.params.id); // Debug log
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
//     console.error('Delete task error:', error);
//     res.status(500).json({ message: error.message || 'Failed to delete task' });
//   }
// };

// exports.getTaskStats = async (req, res) => {
//   try {
//     const query = req.user.role === 'user'
//       ? { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] }
//       : {};
//     console.log('Fetching task stats with query:', query); // Debug log
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
//     console.error('Get task stats error:', error);
//     res.status(500).json({ message: error.message || 'Failed to fetch task stats' });
//   }
// };


// const Task = require('../models/Task');

// const getTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({ createdBy: req.user._id }).populate('assignedTo', 'name');
//     res.status(200).json(tasks);
//   } catch (error) {
//     console.error('Get tasks error:', {
//       message: error.message,
//       stack: error.stack,
//       userId: req.user?._id
//     });
//     res.status(500).json({ message: 'Server error while fetching tasks' });
//   }
// };

// const getTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id).populate('assignedTo', 'name');
//     if (!task) return res.status(404).json({ message: 'Task not found' });
//     if (task.createdBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }
//     res.status(200).json(task);
//   } catch (error) {
//     console.error('Get task error:', {
//       message: error.message,
//       stack: error.stack,
//       taskId: req.params.id,
//       userId: req.user?._id
//     });
//     res.status(500).json({ message: 'Server error while fetching task' });
//   }
// };

// const createTask = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       console.error('Create task error: Missing user ID', { body: req.body });
//       return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
//     }
//     console.log('Creating task with data:', {
//       body: req.body,
//       createdBy: req.user._id
//     });
//     const task = new Task({
//       ...req.body,
//       createdBy: req.user._id
//     });
//     const createdTask = await task.save();
//     res.status(201).json(createdTask);
//   } catch (error) {
//     console.error('Create task error:', {
//       message: error.message,
//       stack: error.stack,
//       body: req.body,
//       userId: req.user?._id
//     });
//     res.status(500).json({ message: 'Server error while creating task', error: error.message });
//   }
// };

// const updateTask = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       console.error('Update task error: Missing user ID', { body: req.body, taskId: req.params.id });
//       return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
//     }
//     console.log('Updating task with data:', {
//       taskId: req.params.id,
//       body: req.body,
//       userId: req.user._id
//     });
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: 'Task not found' });
//     if (task.createdBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }
//     const updatedTask = await Task.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );
//     res.status(200).json(updatedTask);
//   } catch (error) {
//     console.error('Update task error:', {
//       message: error.message,
//       stack: error.stack,
//       taskId: req.params.id,
//       body: req.body,
//       userId: req.user?._id
//     });
//     res.status(500).json({ message: 'Server error while updating task', error: error.message });
//   }
// };

// const deleteTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: 'Task not found' });
//     if (task.createdBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Unauthorized' });
//     }
//     await task.remove();
//     res.status(200).json({ message: 'Task deleted' });
//   } catch (error) {
//     console.error('Delete task error:', {
//       message: error.message,
//       stack: error.stack,
//       taskId: req.params.id,
//       userId: req.user?._id
//     });
//     res.status(500).json({ message: 'Server error while deleting task' });
//   }
// };

// module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };


const Task = require('../models/Task');
const User = require('../models/User');

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id }).populate('assignedTo', 'name');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Get tasks error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error('Get task error:', {
      message: error.message,
      stack: error.stack,
      taskId: req.params.id,
      userId: req.user?._id
    });
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

const createTask = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error('Create task error: Missing user ID', { body: req.body });
      return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    }
    console.log('Creating task with data:', {
      body: req.body,
      createdBy: req.user._id
    });
    const task = new Task({
      ...req.body,
      createdBy: req.user._id
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Create task error:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?._id
    });
    res.status(500).json({ message: 'Server error while creating task', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.error('Update task error: Missing user ID', { body: req.body, taskId: req.params.id });
      return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    }
    console.log('Updating task with data:', {
      taskId: req.params.id,
      body: req.body,
      userId: req.user._id
    });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', {
      message: error.message,
      stack: error.stack,
      taskId: req.params.id,
      body: req.body,
      userId: req.user?._id
    });
    res.status(500).json({ message: 'Server error while updating task', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Verify referenced users exist
    if (task.createdBy) {
      const createdByUser = await User.findById(task.createdBy);
      if (!createdByUser) {
        console.warn('Task createdBy user not found:', task.createdBy);
      }
    }
    if (task.assignedTo) {
      const assignedToUser = await User.findById(task.assignedTo);
      if (!assignedToUser) {
        console.warn('Task assignedTo user not found:', task.assignedTo);
        // Optionally clear invalid reference
        task.assignedTo = undefined;
        await task.save();
      }
    }

    console.log('Deleting task:', {
      taskId: req.params.id,
      userId: req.user._id,
      createdBy: task.createdBy,
      assignedTo: task.assignedTo
    });

    await Task.findByIdAndDelete(req.params.id, { bypassDocumentValidation: true });
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      taskId: req.params.id,
      userId: req.user?._id
    });
    res.status(500).json({ 
      message: 'Server error while deleting task', 
      error: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
