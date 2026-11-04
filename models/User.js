const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
  nationalId: { type: String, unique: true, sparse: true, match: /^\d{13}$/ },
  role: { type: String, enum: ['citizen', 'authority', 'admin'], default: 'citizen' },
  authorityDept: { type: String, trim: true },
  division: { type: String, trim: true },
  district: { type: String, trim: true },
  upazila: { type: String, trim: true },
  union: { type: String, trim: true },
  ward: { type: String, trim: true },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
