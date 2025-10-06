const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: [true, 'A teacher must belong to a college'],
  },
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  department: {
    type: String,
    required: [true, 'Please provide your department'],
  },
  role: {
    type: String,
    default: 'teacher',
    enum: ['teacher', 'hod', 'principal'],
  },
  assignedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  stats: {
    type: String,
    enum: ['engaged', 'free'],
    default: 'free',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Hash password before saving
teacherSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Check if password is correct
teacherSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after token was issued
teacherSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
