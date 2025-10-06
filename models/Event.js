const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: [true, 'An event must belong to a college'],
  },
  type: {
    type: String,
    required: [true, 'Please specify event type'],
    enum: ['college-only', 'inter-college'],
  },
  category: {
    type: String,
    required: [true, 'Please specify event category'],
    enum: ['sports', 'cultural', 'hackathon', 'seminar', 'workshop', 'technical', 'non-technical', 'other'],
  },
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide event description'],
  },
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  results: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'results.winnerModel',
    },
    winnerModel: {
      type: String,
      enum: ['Student', 'Team'],
    },
    runnerUp: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'results.runnerUpModel',
    },
    runnerUpModel: {
      type: String,
      enum: ['Student', 'Team'],
    },
    scoreBoard: [{
      participantId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'results.scoreBoard.participantModel',
      },
      participantModel: {
        type: String,
        enum: ['Student', 'Team'],
      },
      score: Number,
      rank: Number,
    }],
  },
  timeline: [{
    title: {
      type: String,
      required: [true, 'Please provide timeline event title'],
    },
    description: String,
    date: {
      type: Date,
      required: [true, 'Please provide timeline event date'],
    },
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
  }],
  analytics: {
    totalParticipants: {
      type: Number,
      default: 0,
    },
    totalTeams: {
      type: Number,
      default: 0,
    },
    avgScore: {
      type: Number,
      default: 0,
    },
    attendance: {
      type: Number,
      default: 0,
    },
  },
  maxParticipants: {
    type: Number,
    default: 100,
  },
  registrationDeadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return value < this.startDate;
      },
      message: 'Registration deadline must be before the event starts',
    },
  },
  location: String,
  image: {
    type: String,
    default: 'default-event.jpg',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Update analytics when participants are added
eventSchema.pre('save', function(next) {
  if (this.isModified('participants')) {
    this.analytics.totalParticipants = this.participants.length;
  }
  if (this.isModified('teams')) {
    this.analytics.totalTeams = this.teams.length;
  }
  next();
});

// Virtual for duration in days
eventSchema.virtual('durationInDays').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for registration status
eventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
