const mongoose = require('mongoose');

const handSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  handNumber: {
    type: Number,
    required: true,
    min: 1
  },
  position: {
    type: String,
    required: true,
    enum: ['UTG', 'UTG+1', 'UTG+2', 'UTG+3', 'MP', 'MP+1', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
    trim: true
  },
  holeCards: {
    type: [String],
    required: true,
    validate: {
      validator: function(cards) {
        console.log('Hand Model: Validating holeCards:', cards);
        console.log('Hand Model: holeCards length:', cards ? cards.length : 'undefined');
        console.log('Hand Model: holeCards is array:', Array.isArray(cards));
        const isValid = Array.isArray(cards) && cards.length === 2;
        console.log('Hand Model: holeCards validation result:', isValid);
        return isValid;
      },
      message: 'Hole cards must contain exactly 2 cards'
    }
  },
  communityCards: {
    type: [String],
    default: []
  },
  actions: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  result: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  importance: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true,
  versionKey: false
});

// Compound indexes for efficient querying
handSchema.index({ sessionId: 1, handNumber: 1 }, { unique: true });
handSchema.index({ userId: 1, createdAt: -1 });

const Hand = mongoose.model('Hand', handSchema);

module.exports = Hand;