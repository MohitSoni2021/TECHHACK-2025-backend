const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'A team must belong to an event'],
  },
  teamName: {
    type: String,
    required: [true, 'Please provide a team name'],
    trim: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    validate: {
      validator: function(members) {
        return members.length > 0 && members.length <= 10; // Assuming max 10 members per team
      },
      message: 'A team must have between 1 and 10 members',
    },
  }],
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'A team must have a leader'],
    validate: {
      validator: function(leaderId) {
        return this.members.some(member => member.toString() === leaderId.toString());
      },
      message: 'Team leader must be a member of the team',
    },
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
  },
  rank: {
    type: Number,
    min: 1,
  },
  joinCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Ensure team name is unique within an event
teamSchema.index({ event: 1, teamName: 1 }, { unique: true });

// Ensure a student can only be in one team per event
teamSchema.index({ event: 1, members: 1 }, { unique: true });

// Generate a random join code before saving
teamSchema.pre('save', async function(next) {
  if (!this.joinCode) {
    this.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
