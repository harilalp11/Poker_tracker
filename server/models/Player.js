const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  alias: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  venue: {
    type: String,
    trim: true,
    maxlength: 100
  },
  handsPlayed: {
    type: Number,
    default: 0,
    min: 0
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  profitAgainst: {
    type: Number,
    default: 0
  },
  winRateAgainst: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  playingStyle: {
    vpip: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    pfr: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    aggression: {
      type: Number,
      default: 0,
      min: 0
    },
    tightness: {
      type: String,
      enum: ['tight', 'loose', 'balanced'],
      default: 'balanced'
    },
    aggression_level: {
      type: String,
      enum: ['passive', 'aggressive', 'balanced'],
      default: 'balanced'
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Compound index for efficient querying by user
playerSchema.index({ userId: 1, name: 1 });
playerSchema.index({ userId: 1, lastSeen: -1 });

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;