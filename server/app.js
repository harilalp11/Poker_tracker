const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();

console.log('App: Starting PokerTrack server');
console.log('App: Environment:', process.env.NODE_ENV || 'development');

// Middleware
console.log('App: Setting up CORS');
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

console.log('App: Setting up JSON parsing middleware');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`App: ${req.method} ${req.originalUrl}`);
  console.log('App: Request headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('App: Request body keys:', Object.keys(req.body));
  }
  next();
});

// Database connection
console.log('App: Connecting to MongoDB');
console.log('App: MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pokertrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('App: Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('App: MongoDB connection error:', error);
  console.error('App: MongoDB connection error stack:', error.stack);
  process.exit(1);
});

// Import routes
console.log('App: Importing API routes');
const apiRoutes = require('./routes/api');

// API routes - NO GLOBAL AUTH MIDDLEWARE
console.log('App: Mounting API routes at /api WITHOUT global auth middleware');
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('App: Health check requested');
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  console.log('App: Setting up static file serving for production');
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    console.log('App: Serving React app for route:', req.originalUrl);
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('App: Unhandled error:', error);
  console.error('App: Unhandled error stack:', error.stack);
  console.error('App: Request URL:', req.originalUrl);
  console.error('App: Request method:', req.method);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('App: 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App: Server running on port ${PORT}`);
  console.log('App: Server startup complete');
});

module.exports = app;