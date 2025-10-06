const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide college name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide college email'],
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
  address: {
    type: String,
    required: [true, 'Please provide college address'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Please provide contact number'],
  },
  website: {
    type: String,
    validate: [validator.isURL, 'Please provide a valid URL'],
  },
  logo: {
    type: String,
    default: 'default-logo.jpg',
  },
  seal: {
    type: String,
    default: 'default-seal.jpg',
  },
  headSignature: {
    type: String,
    default: 'default-signature.jpg',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  }],
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
collegeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Check if password is correct
collegeSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Check if password was changed after token was issued
collegeSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const College = mongoose.model('College', collegeSchema);

module.exports = College;
