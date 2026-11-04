const User = require('../models/User');
const Report = require('../models/Report');
const Category = require('../models/Category');
const Location = require('../models/Location');

exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password').skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role, authorityDept } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, authorityDept }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Category deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getLocations = async (req, res) => {
  try {
    const { type, parentId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (parentId) filter.parent = parentId;
    const locations = await Location.find(filter).sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReports = await Report.countDocuments();
    const totalCategories = await Category.countDocuments({ isActive: true });
    const flaggedReports = await Report.countDocuments({ isFlagged: true });
    const byStatus = await Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byCategory = await Report.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const byDivision = await Report.aggregate([{ $group: { _id: '$location.division', count: { $sum: 1 } } }]);
    const recentReports = await Report.find().populate('category', 'name').populate('reportedBy', 'name').sort({ createdAt: -1 }).limit(10);
    const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    res.json({ totalUsers, totalReports, totalCategories, flaggedReports, byStatus, byCategory, byDivision, recentReports, usersByRole });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignAuthority = async (req, res) => {
  try {
    const { authorityId } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { assignedAuthority: authorityId }, { new: true });
    if (authorityId) {
      const Notification = require('../models/Notification');
      await new Notification({ user: authorityId, type: 'report_received', message: `You have been assigned a new report: ${report.title}`, report: report._id }).save();
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
