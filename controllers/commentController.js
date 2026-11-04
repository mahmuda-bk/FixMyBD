const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Report = require('../models/Report');

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const comment = new Comment({ report: req.params.id, user: req.session.user._id, text });
    await comment.save();
    const populated = await Comment.findById(comment._id).populate('user', 'name role');
    const report = await Report.findById(req.params.id);
    if (report.reportedBy.toString() !== req.session.user._id.toString()) {
      await new Notification({ user: report.reportedBy, type: 'comment', message: `New comment on "${report.title}"`, report: report._id }).save();
    }
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ report: req.params.id }).populate('user', 'name role').sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.user.toString() !== req.session.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
