const User = require('../models/User');
const fs = require('fs');

const removeUploaded = (file) => { if (file && file.path) fs.unlink(file.path, () => {}); };

exports.register = async (req, res) => {
  // if registration fails, don't leave an orphan image in uploads/
  res.on('finish', () => { if (res.statusCode >= 400) removeUploaded(req.file); });
  try {
    const { name, email, password, phone, role, division, district, upazila, union, ward, authorityDept, nationalId } = req.body;
    const normalizedNid = String(nationalId || '').trim();
    if (!/^\d{13}$/.test(normalizedNid)) return res.status(400).json({ error: 'National ID must contain exactly 13 digits' });
    if (!['citizen', 'authority'].includes(role)) return res.status(400).json({ error: 'Invalid registration role' });
    if (role === 'authority' && !req.file) return res.status(400).json({ error: 'Authority profile picture is required' });
    const existingUser = await User.findOne({ email: String(email || '').toLowerCase().trim() });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });
    const existingNid = await User.findOne({ nationalId: normalizedNid });
    if (existingNid) return res.status(409).json({ error: 'This National ID is already registered' });
    const user = new User({ name, email, password, phone, role, nationalId: normalizedNid, division, district, upazila, union, ward, authorityDept, ...(req.file ? { avatar: '/uploads/' + req.file.filename } : {}) });
    await user.save();
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.status(201).json({ message: 'Registration successful', user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ error: 'This National ID or email is already registered' });
    if (err && err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated' });

    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.json({ message: 'Login successful', user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'division', 'district', 'upazila', 'union', 'ward', 'avatar'];
    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
        updates[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
      }
    }
    if (updates.name !== undefined && !updates.name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const user = await User.findById(req.session.user._id);
    if (!user) return res.status(404).json({ error: 'Account not found' });
    Object.assign(user, updates);
    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    // Keep session identity in sync with saved profile fields.
    req.session.user.name = user.name;
    req.session.user.email = user.email;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfileStats = async (req, res) => {
  try {
    const Report = require('../models/Report');
    const Comment = require('../models/Comment');
    const userId = req.session.user._id;
    const [reports, resolved, supports, comments, feedbacks] = await Promise.all([
      Report.countDocuments({ reportedBy: userId }),
      Report.countDocuments({ reportedBy: userId, status: 'Completed' }),
      Report.countDocuments({ supports: userId }),
      Comment.countDocuments({ user: userId }),
      Report.find({ reportedBy: userId, 'citizenFeedback.rating': { $exists: true } }).select('citizenFeedback.rating')
    ]);
    const avgRating = feedbacks.length ? Number((feedbacks.reduce((sum, r) => sum + (r.citizenFeedback.rating || 0), 0) / feedbacks.length).toFixed(1)) : 0;
    const score = reports * 10 + resolved * 15 + supports * 2 + comments;
    const level = score >= 200 ? 'Civic Champion' : score >= 100 ? 'Community Leader' : score >= 50 ? 'Active Citizen' : 'New Contributor';
    res.json({ reports, resolved, supports, comments, avgRating, score, level });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
