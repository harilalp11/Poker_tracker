const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const sessionRoutes = require('./sessionRoutes');
const statisticsRoutes = require('./statisticsRoutes');

console.log('API Routes: Setting up API routes');
console.log('API Routes: Auth routes imported');
console.log('API Routes: Session routes imported');
console.log('API Routes: Statistics routes imported');

// Use route modules
console.log('API Routes: Mounting auth routes at /auth');
router.use('/auth', authRoutes);

console.log('API Routes: Mounting session routes at /sessions');
router.use('/sessions', sessionRoutes);

console.log('API Routes: Mounting statistics routes at /statistics');
router.use('/statistics', statisticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('API: Health check requested');
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

console.log('API Routes: All routes mounted successfully');

module.exports = router;