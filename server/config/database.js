const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Database: Attempting to connect to MongoDB...');
    console.log('Database: Connection string:', process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

    const conn = await mongoose.connect(process.env.DATABASE_URL);

    console.log('Database: MongoDB Connected successfully');
    console.log('Database: Connected to database:', conn.connection.name);
    console.log('Database: Connection host:', conn.connection.host);

    // Clean up old indexes after connection
    await cleanupOldIndexes();

  } catch (error) {
    console.error('Database: MongoDB connection error:', error.message);
    console.error('Database: Full error:', error);
    process.exit(1);
  }
};

const cleanupOldIndexes = async () => {
  try {
    console.log('Database: Checking for old indexes to clean up...');

    // Get the User collection
    const db = mongoose.connection.db;
    const userCollection = db.collection('users');

    // Get current indexes
    const indexes = await userCollection.indexes();
    console.log('Database: Current user collection indexes:', indexes.map(idx => idx.name));

    // Check if refreshToken_1 index exists and drop it
    const refreshTokenIndex = indexes.find(idx => idx.name === 'refreshToken_1');
    if (refreshTokenIndex) {
      console.log('Database: Found refreshToken_1 index, dropping it...');
      await userCollection.dropIndex('refreshToken_1');
      console.log('Database: Successfully dropped refreshToken_1 index');
    } else {
      console.log('Database: No refreshToken_1 index found, no cleanup needed');
    }

  } catch (error) {
    console.log('Database: Index cleanup error (this is normal if index doesn\'t exist):', error.message);
  }
};

module.exports = { connectDB };