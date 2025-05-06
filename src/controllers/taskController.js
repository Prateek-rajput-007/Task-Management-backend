const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Create task validation errors:', errors.array());
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
    console.log('Creating task with data:', req.body, 'by user:', req.user?.id);
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
      try {
        const notification = new Notification({
          user: assignedTo,
          message: `You have been assigned a new task: ${title}`,
          task: createdTask._id,
        });
        await notification.save();
        console.log('Notification created for user:', assignedTo);
      } catch (notificationError) {
        console.error('Notification creation error:', notificationError);
      }
    }

    res.status(201).json(createdTask);
  } catch (error) {
    console.error('Create task error:', {
      message: error.message,
      stack: error.stack,
    });
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ message: 'Failed to create task', error: error.message });
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

    console.log('Fetching tasks with query:', query, 'by user:', req.user?.id);
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    console.log('Fetching task with ID:', req.params.id, 'by user:', req.user?.id);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
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
    console.error('Get task error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    console.log('Update task request:', {
      taskId: req.params.id,
      user: req.user,
      body: req.body,
    });

    // Validate task ID
    if (!mongoose.isValidObjectId(req.params.id)) {
      console.log('Invalid task ID:', req.params.id);
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    // Validate req.user
    if (!req.user || !req.user.id) {
      console.log('Invalid user data:', req.user);
      return res.status(401).json({ message: 'User authentication required' });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Update task validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    // Find task
    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (
      req.user.role !== 'admin' &&
      task.createdBy.toString() !== req.user.id
    ) {
      console.log('Access denied for user:', req.user.id, 'on task:', task._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prepare updates
    const { assignedTo, ...updates } = req.body;
    if (req.user.role === 'admin' && assignedTo !== undefined) {
      updates.assignedTo = assignedTo === '' ? null : assignedTo;
      if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
        try {
 Tertiary
        {
          if (!mongoose.isValidObjectId(assignedTo)) {
            console.log('Invalid assignedTo ID:', assignedTo);
            return res.status(400).json({ message: 'Invalid assignedTo ID' });
          }
          const notification = new Notification({
            user: assignedTo,
            message: `Task "${task.title}" has been reassigned to you`,
            task: task._id,
          });
          await notification.save();
          console.log('Notification created for user:', assignedTo);
        } catch (notificationError) {
          console.error('Notification creation error:', {
            message: notificationError.message,
            stack: notificationError.stack,
          });
        }
      }
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      console.log('Task update failed for ID:', req.params.id);
      return res.status(404).json({ message: 'Task not found' });
    }

    console.log('Task updated successfully:', updatedTask._id);
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', {
      message: error.message,
      stack: error.stack,
      taskId: req.params.id,
      user: req.user,
      body: req.body,
    });
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: messages });
    }
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    console.log('Deleting task with ID:', req.params.id, 'by user:', req.user?.id);
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }
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
    console.error('Delete task error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const query = req.user.role === 'user'
      ? { $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }] }
      : {};
    console.log('Fetching task stats with query:', query, 'by user:', req.user?.id);
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
    console.error('Get task stats error:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Failed to fetch task stats', error: error.message });
  }
};
