const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'A certificate must belong to an event'],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'A certificate must be issued to a student'],
  },
  title: {
    type: String,
    required: [true, 'Please provide a certificate title'],
    enum: ['Winner', '1st Runner Up', '2nd Runner Up', 'Participation', 'Excellence', 'Special Recognition'],
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'issuerModel',
    required: [true, 'Please specify who issued this certificate'],
  },
  issuerModel: {
    type: String,
    required: [true, 'Please specify the issuer model type'],
    enum: ['Teacher', 'College'],
  },
  dateIssued: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  certificateUrl: {
    type: String,
    required: [true, 'Please provide the certificate URL'],
  },
  verificationCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  collegeLogo: {
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
  description: {
    type: String,
    trim: true,
  },
  additionalInfo: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Ensure a student can only have one certificate per event
certificateSchema.index({ event: 1, student: 1 }, { unique: true });

// Generate a verification code before saving
certificateSchema.pre('save', async function(next) {
  if (!this.verificationCode) {
    this.verificationCode = await generateVerificationCode();
  }
  next();
});

// Virtual for verification URL
certificateSchema.virtual('verificationUrl').get(function() {
  return `/api/v1/certificates/verify/${this.verificationCode}`;
});

// Generate a random verification code
async function generateVerificationCode() {
  const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
  const exists = await this.constructor.findOne({ verificationCode: randomString });
  return exists ? generateVerificationCode() : randomString;
}

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
