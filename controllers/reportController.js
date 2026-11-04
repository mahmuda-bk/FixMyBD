const Report = require('../models/Report');
const Notification = require('../models/Notification');
const Category = require('../models/Category');
const User = require('../models/User');

// Resolve the exact report category allowed for this authority account.
async function authorityCategoryIds(userId) {
  const user = await User.findById(userId).select('role authorityDept');
  if (!user || user.role !== 'authority' || !user.authorityDept || !user.authorityDept.trim()) return [];
  const category = await Category.findOne({ name: { $regex: '^' + user.authorityDept.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', $options: 'i' } }).select('_id');
  return category ? [category._id] : [];
}

async function authorityCanAccessReport(user, report) {
  if (!user || user.role !== 'authority') return true;
  const ids = await authorityCategoryIds(user._id);
  const reportCategoryId = report.category && report.category._id ? report.category._id.toString() : String(report.category);
  return ids.some(id => id.toString() === reportCategoryId);
}

exports.createReport = async (req, res) => {
  try {
    const { title, description, category, division, district, upazila, union, ward, lat, lng, address } = req.body;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const uploadedFiles = req.files || {};
    const legacyPhoto = uploadedFiles.photo && uploadedFiles.photo[0] ? `/uploads/${uploadedFiles.photo[0].filename}` : null;
    const galleryPhotos = (uploadedFiles.photos || []).map(file => `/uploads/${file.filename}`);
    const allPhotos = legacyPhoto ? [legacyPhoto, ...galleryPhotos] : galleryPhotos;
    const report = new Report({
      title, description, category, reportedBy: req.session.user._id,
      location: {
        division, district, upazila, union, ward,
        lat: Number.isNaN(latNum) ? undefined : latNum,
        lng: Number.isNaN(lngNum) ? undefined : lngNum,
        address
      },
      photo: allPhotos[0] || null,
      photos: allPhotos,
      authorityResponse: 'Your report has been received successfully. Our team will review the issue and take the necessary action. You will be notified when there is an update.',
      timeline: [{ status: 'Submitted', note: 'Report submitted. The issue has been received for review.', updatedBy: req.session.user._id }]
    });
    await report.save();
    await Category.findByIdAndUpdate(category, { $inc: { reportCount: 1 } });

    const admins = await require('../models/User').find({ role: 'admin' });
    for (const admin of admins) {
      await new Notification({ user: admin._id, type: 'report_received', message: `New report: ${title}`, report: report._id }).save();
    }
    await new Notification({
      user: req.session.user._id,
      type: 'authority_response',
      message: 'Your report has been received. Our team will review it and notify you about the next update.',
      report: report._id
    }).save();
    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { status, category, division, district, upazila, q, sort = 'newest', page = 1, limit = 12 } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit) || 12, 1), 50);
    const safePage = Math.max(parseInt(page) || 1, 1);
    const filter = { isPublic: true, isFlagged: false };
    if (status) filter.status = status;
    if (category) {
      if (filter.category && filter.category.$in) {
        const allowed = filter.category.$in.map(String);
        filter.category = allowed.includes(String(category)) ? category : { $in: [] };
      } else filter.category = category;
    }
    if (division) filter['location.division'] = division;
    if (district) filter['location.district'] = district;
    if (upazila) filter['location.upazila'] = upazila;
    if (q && q.trim()) {
      const query = q.trim();
      const matchingCategories = await Category.find({ name: { $regex: query, $options: 'i' } }).select('_id');
      const or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'location.division': { $regex: query, $options: 'i' } },
        { 'location.district': { $regex: query, $options: 'i' } },
        { 'location.upazila': { $regex: query, $options: 'i' } },
        { 'location.address': { $regex: query, $options: 'i' } }
      ];
      if (matchingCategories.length) or.push({ category: { $in: matchingCategories.map(c => c._id) } });
      filter.$or = or;
    }
    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, supported: { supportCount: -1, createdAt: -1 }, updated: { updatedAt: -1 } };
    const sortOption = sortMap[sort] || sortMap.newest;
    const reports = await Report.find(filter)
      .populate('category', 'name icon color')
      .populate('reportedBy', 'name')
      .sort(sortOption)
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit);
    const total = await Report.countDocuments(filter);
    res.json({ reports, total, page: safePage, limit: safeLimit, pages: Math.ceil(total / safeLimit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('category', 'name icon color')
      .populate('reportedBy', 'name email')
      .populate('assignedAuthority', 'name authorityDept')
      .populate('timeline.updatedBy', 'name role');
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.session.user._id })
      .populate('category', 'name icon color')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.supportReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    const userId = req.session.user._id;
    const idx = report.supports.indexOf(userId);
    if (idx === -1) {
      report.supports.push(userId);
      report.supportCount += 1;
    } else {
      report.supports.splice(idx, 1);
      report.supportCount -= 1;
    }
    await report.save();
    res.json({ supportCount: report.supportCount, supported: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, note, estimatedResolutionDate, authorityResponse } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (req.session.user.role === 'authority' && (!report.assignedAuthority || report.assignedAuthority.toString() !== req.session.user._id.toString())) {
      return res.status(403).json({ error: 'You can only edit reports assigned to your account' });
    }

    const autoResponses = {
      'Acknowledged': 'We have received your report and acknowledged the issue. Our team will review it and proceed with the necessary assessment.',
      'Under Assessment': 'Your report is now under assessment. Our team is reviewing the issue and will determine the appropriate action.',
      'Action Planned': 'The issue has been reviewed and an action plan has been prepared. We will update you as work progresses.',
      'In Progress': 'Work on the reported issue has started. We will keep you informed about the progress.',
      'Completed': 'The reported issue has been marked as completed. Please review the result and provide your feedback.',
      'On Hold': 'Your report is currently on hold due to a temporary constraint. We will update you when work can resume.',
      'Rejected': 'After review, this report could not be accepted for action at this time. Please check the report details or contact the authority for clarification.'
    };
    report.status = status;
    report.authorityResponse = (authorityResponse || '').trim() || autoResponses[status] || 'Your report has been reviewed. We will keep you informed about further updates.';
    if (estimatedResolutionDate) report.estimatedResolutionDate = new Date(estimatedResolutionDate);
    else if (status === 'Completed') report.estimatedResolutionDate = undefined;
    report.timeline.push({ status, note: note || report.authorityResponse, updatedBy: req.session.user._id });
    await report.save();

    await new Notification({ user: report.reportedBy, type: 'status_update', message: `Report "${report.title}" status updated to ${status}`, report: report._id }).save();
    await new Notification({ user: report.reportedBy, type: 'authority_response', message: report.authorityResponse, report: report._id }).save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { rating, comment, accepted } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.reportedBy.toString() !== req.session.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });

    report.citizenFeedback = { rating, comment, accepted, date: new Date() };
    if (accepted) report.status = 'Citizen Feedback';
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.flagReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { isFlagged: true }, { new: true });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const statsFilter = {};
    if (req.session && req.session.user && req.session.user.role === 'authority') statsFilter.assignedAuthority = req.session.user._id;
    const total = await Report.countDocuments(statsFilter);
    const byStatus = await Report.aggregate([{ $match: statsFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byCategory = await Report.aggregate([{ $match: statsFilter }, { $group: { _id: '$category', count: { $sum: 1 } } }]);
    const byDivision = await Report.aggregate([{ $match: statsFilter }, { $group: { _id: '$location.division', count: { $sum: 1 } } }]);
    const recent = await Report.find(statsFilter).populate('category', 'name').populate('reportedBy', 'name').sort({ createdAt: -1 }).limit(5);
    const resolved = await Report.countDocuments({ ...statsFilter, status: 'Completed' });
    const activeCitizens = await require('../models/User').countDocuments({ role: 'citizen', isActive: true });
    const supportedFilter = { ...statsFilter, isPublic: true, isFlagged: false };
    const supported = await Report.find(supportedFilter).sort({ supportCount: -1 }).limit(5).populate('category', 'name icon color').populate('reportedBy', 'name');
    const supportTotals = await Report.aggregate([{ $match: supportedFilter }, { $group: { _id: null, total: { $sum: '$supportCount' } } }]);
    const totalSupports = supportTotals[0] ? supportTotals[0].total : 0;
    res.json({ total, resolved, activeCitizens, totalSupports, byStatus, byCategory, byDivision, recent, supported });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAuthorityReports = async (req, res) => {
  try {
    const user = req.session.user;
    const view = req.query.view || 'assigned';
    const filter = user.role === 'authority'
      ? (view === 'all-public' ? { isPublic: true, isFlagged: false } : { assignedAuthority: user._id })
      : {};
    // Authority accounts can browse all public reports, but only assigned reports are editable.
    const reports = await Report.find(filter)
      .populate('category', 'name icon color')
      .populate('reportedBy', 'name')
      .populate('assignedAuthority', 'name authorityDept')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
