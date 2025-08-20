const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        console.log('Session Model: Date validation - value:', value, 'type:', typeof value);
        console.log('Session Model: Date validation - is valid date:', value instanceof Date);
        console.log('Session Model: Date validation - is valid date string:', !isNaN(Date.parse(value)));
        const isValid = value instanceof Date || !isNaN(Date.parse(value));
        console.log('Session Model: Date validation result:', isValid);
        return isValid;
      },
      message: 'Date must be a valid date'
    }
  },
  venue: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  stakes: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  gameType: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    default: 'Texas Hold\'em'
  },
  tableSize: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
    default: '6-max'
  },
  buyIn: {
    type: Number,
    required: true,
    min: 0
  },
  cashOut: {
    type: Number,
    default: 0,
    min: 0
  },
  profit: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  handsPlayed: {
    type: Number,
    default: 0,
    min: 0
  },
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
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Pre-save middleware to calculate duration
sessionSchema.pre('save', function(next) {
  console.log('Session Model: Pre-save middleware triggered');
  console.log('Session Model: Pre-save - date field:', this.date, 'type:', typeof this.date);
  console.log('Session Model: Pre-save - all fields:', JSON.stringify(this.toObject(), null, 2));

  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60)); // Duration in minutes
    console.log('Session Model: Pre-save - calculated duration:', this.duration);
  }
  next();
});

// Compound indexes for efficient querying
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, status: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;