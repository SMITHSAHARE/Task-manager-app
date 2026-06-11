const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(403).json({ message: 'Cannot delete an Admin user' });
    }

    const userName = user.name;
    await Task.deleteMany({ createdBy: user._id });
    await user.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      action: 'USER_DELETED',
      description: `Admin deleted user "${userName}"`,
      metadata: { deletedUserId: req.params.id },
    });

    res.json({ message: 'User and their tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Active or Inactive' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Admin') {
      return res.status(403).json({ message: "Cannot change Admin's status" });
    }

    user.status = status;
    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'USER_STATUS_UPDATED',
      description: `Admin set user "${user.name}" to ${status}`,
      metadata: { targetUserId: user._id, newStatus: status },
    });

    res.json({
      message: `User status updated to ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAnyTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskTitle = task.title;
    await task.deleteOne();

    await ActivityLog.create({
      user: req.user._id,
      action: 'TASK_DELETED',
      description: `Admin deleted task "${taskTitle}"`,
      metadata: { taskId: req.params.id },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'User' });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
    const activeUsers = await User.countDocuments({ role: 'User', status: 'Active' });
    const inactiveUsers = await User.countDocuments({ role: 'User', status: 'Inactive' });

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getAllTasks,
  deleteAnyTask,
  getAnalytics,
};
