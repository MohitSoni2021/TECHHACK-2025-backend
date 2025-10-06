const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'A notification must belong to an event'],
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: [true, 'Please specify who sent this notification'],
  },
  senderModel: {
    type: String,
    required: [true, 'Please specify the sender model type'],
    enum: ['Teacher', 'College'],
  },
  receivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Please specify at least one receiver'],
  }],
  message: {
    type: String,
    required: [true, 'Please provide a notification message'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Please specify notification type'],
    enum: ['general', 'urgent', 'update', 'announcement', 'reminder'],
    default: 'general',
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread',
  },
  actionUrl: {
    type: String,
    description: 'URL for any action related to this notification',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Additional data related to the notification',
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default to 30 days from now
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Index for faster querying of unread notifications
notificationSchema.index({ receivers: 1, status: 1 });

// Index for TTL (auto-delete expired notifications)
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted date
notificationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  return this.save();
};

// Method to mark notification as unread
notificationSchema.methods.markAsUnread = function() {
  this.status = 'unread';
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
