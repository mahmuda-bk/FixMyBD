const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAuthority: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  estimatedResolutionDate: { type: Date },
  authorityResponse: { type: String, trim: true },
  photo: { type: String },
  photos: [{ type: String }],
  location: {
    division: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    union: { type: String },
    ward: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  status: {
    type: String,
    enum: ['Submitted', 'Acknowledged', 'Under Assessment', 'Action Planned', 'In Progress', 'Completed', 'Citizen Feedback', 'On Hold', 'Rejected', 'Reopened'],
    default: 'Submitted'
  },
  supports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  supportCount: { type: Number, default: 0 },
  timeline: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    photo: String,
    date: { type: Date, default: Date.now }
  }],
  citizenFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    accepted: { type: Boolean },
    date: { type: Date }
  },
  isPublic: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

reportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', reportSchema);
