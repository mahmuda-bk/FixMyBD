const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  icon: { type: String },
  color: { type: String, default: '#3498db' },
  isActive: { type: Boolean, default: true },
  reportCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Category', categorySchema);
