const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['division', 'district', 'upazila', 'union', 'ward'], required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  code: { type: String },
  lat: { type: Number },
  lng: { type: Number }
});

module.exports = mongoose.model('Location', locationSchema);
