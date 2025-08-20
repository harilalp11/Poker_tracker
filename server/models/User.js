const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  totalProfit: {
    type: Number,
    default: 0
  },
  preferredStakes: {
    type: String,
    default: '$1/$2'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Ensure password field is included in all operations
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    // Only remove password when converting to JSON for API responses
    // This doesn't affect database operations
    delete ret.password;
    return ret;
  }
});

// Drop the refreshToken index if it exists (cleanup from old schema)
userSchema.post('init', async function() {
  try {
    const User = mongoose.model('User');
    const indexes = await User.collection.getIndexes();
    console.log('User model: Current indexes:', Object.keys(indexes));
    
    if (indexes.refreshToken_1) {
      console.log('User model: Dropping refreshToken_1 index');
      await User.collection.dropIndex('refreshToken_1');
      console.log('User model: Successfully dropped refreshToken_1 index');
    }
  } catch (error) {
    console.log('User model: Error managing indexes (this is normal if index doesn\'t exist):', error.message);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;