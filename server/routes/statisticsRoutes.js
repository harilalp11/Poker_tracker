const express = require('express');
const StatisticsService = require('../services/statisticsService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// Get win rate statistics
router.get('/win-rate', requireUser, async (req, res) => {
  console.log('=== WIN RATE ENDPOINT START ===');
  console.log('GET /api/statistics/win-rate - Getting win rate for user:', req.user.email);
  console.log('GET /api/statistics/win-rate - User ID:', req.user._id);
  console.log('GET /api/statistics/win-rate - Request timestamp:', new Date().toISOString());

  try {
    console.log('GET /api/statistics/win-rate - Calling StatisticsService.calculateWinRate');
    const winRateStats = await StatisticsService.calculateWinRate(req.user._id);
    console.log('GET /api/statistics/win-rate - Win rate stats calculated:', winRateStats);

    console.log('GET /api/statistics/win-rate - Successfully calculated win rate');
    console.log('=== WIN RATE ENDPOINT SUCCESS ===');
    return res.status(200).json({
      success: true,
      data: winRateStats
    });
  } catch (error) {
    console.error('=== WIN RATE ENDPOINT ERROR ===');
    console.error('GET /api/statistics/win-rate - Error:', error);
    console.error('GET /api/statistics/win-rate - Error stack:', error.stack);
    console.error('=== WIN RATE ENDPOINT ERROR END ===');
    return res.status(500).json({
      error: error.message
    });
  }
});

// Get VPIP statistics
router.get('/vpip', requireUser, async (req, res) => {
  console.log('=== VPIP ENDPOINT START ===');
  console.log('GET /api/statistics/vpip - Getting VPIP for user:', req.user.email);
  console.log('GET /api/statistics/vpip - User ID:', req.user._id);
  console.log('GET /api/statistics/vpip - Request timestamp:', new Date().toISOString());

  try {
    console.log('GET /api/statistics/vpip - Calling StatisticsService.calculateVPIP');
    const vpipStats = await StatisticsService.calculateVPIP(req.user._id);
    console.log('GET /api/statistics/vpip - VPIP stats calculated:', vpipStats);

    console.log('GET /api/statistics/vpip - Successfully calculated VPIP');
    console.log('=== VPIP ENDPOINT SUCCESS ===');
    return res.status(200).json({
      success: true,
      data: vpipStats
    });
  } catch (error) {
    console.error('=== VPIP ENDPOINT ERROR ===');
    console.error('GET /api/statistics/vpip - Error:', error);
    console.error('GET /api/statistics/vpip - Error stack:', error.stack);
    console.error('=== VPIP ENDPOINT ERROR END ===');
    return res.status(500).json({
      error: error.message
    });
  }
});

// Get PFR statistics
router.get('/pfr', requireUser, async (req, res) => {
  console.log('=== PFR ENDPOINT START ===');
  console.log('GET /api/statistics/pfr - Getting PFR for user:', req.user.email);
  console.log('GET /api/statistics/pfr - User ID:', req.user._id);
  console.log('GET /api/statistics/pfr - Request timestamp:', new Date().toISOString());

  try {
    console.log('GET /api/statistics/pfr - Calling StatisticsService.calculatePFR');
    const pfrStats = await StatisticsService.calculatePFR(req.user._id);
    console.log('GET /api/statistics/pfr - PFR stats calculated:', pfrStats);

    console.log('GET /api/statistics/pfr - Successfully calculated PFR');
    console.log('=== PFR ENDPOINT SUCCESS ===');
    return res.status(200).json({
      success: true,
      data: pfrStats
    });
  } catch (error) {
    console.error('=== PFR ENDPOINT ERROR ===');
    console.error('GET /api/statistics/pfr - Error:', error);
    console.error('GET /api/statistics/pfr - Error stack:', error.stack);
    console.error('=== PFR ENDPOINT ERROR END ===');
    return res.status(500).json({
      error: error.message
    });
  }
});

// Get comprehensive analytics (enhanced version of existing analytics)
router.get('/analytics', requireUser, async (req, res) => {
  console.log('=== ANALYTICS ENDPOINT START ===');
  console.log('GET /api/statistics/analytics - Request received');
  console.log('GET /api/statistics/analytics - User authenticated:', req.user.email);
  console.log('GET /api/statistics/analytics - User ID:', req.user._id);
  console.log('GET /api/statistics/analytics - Query parameters:', req.query);
  console.log('GET /api/statistics/analytics - Request timestamp:', new Date().toISOString());

  try {
    const { dateFrom, dateTo, stakes } = req.query;

    console.log('GET /api/statistics/analytics - Starting comprehensive analytics calculation');
    console.log('GET /api/statistics/analytics - Calling StatisticsService.getComprehensiveAnalytics');
    // For now, we'll ignore filters and return all data
    // In a production app, you'd filter based on these parameters
    const analytics = await StatisticsService.getComprehensiveAnalytics(req.user._id);

    console.log('GET /api/statistics/analytics - Successfully calculated comprehensive analytics');
    console.log('GET /api/statistics/analytics - Analytics overview:', analytics?.overview);
    console.log('GET /api/statistics/analytics - Hourly rate in response:', analytics?.overview?.hourlyRate);
    console.log('=== ANALYTICS ENDPOINT SUCCESS ===');

    return res.status(200).json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    console.error('=== ANALYTICS ENDPOINT ERROR ===');
    console.error('GET /api/statistics/analytics - Error:', error);
    console.error('GET /api/statistics/analytics - Error stack:', error.stack);
    console.error('=== ANALYTICS ENDPOINT ERROR END ===');
    return res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;