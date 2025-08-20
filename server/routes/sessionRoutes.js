const express = require('express');
const SessionService = require('../services/sessionService');
const HandService = require('../services/handService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// Create a new session
router.post('/', requireUser, async (req, res) => {
  try {
    console.log('Sessions API: POST /api/sessions - Request received');
    console.log('Sessions API: Request body:', JSON.stringify(req.body, null, 2));
    console.log('Sessions API: Date field in request:', req.body.date, 'Type:', typeof req.body.date);
    console.log('Sessions API: User ID:', req.user._id);

    const sessionData = {
      ...req.body,
      userId: req.user._id
    };

    console.log('Sessions API: Final session data before creation:', JSON.stringify(sessionData, null, 2));
    console.log('Sessions API: Date field after merge:', sessionData.date, 'Type:', typeof sessionData.date);

    const session = await SessionService.createSession(sessionData);

    console.log('Sessions API: Session created successfully:', session._id);
    return res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Sessions API: Error creating session:', error);
    console.error('Sessions API: Error message:', error.message);
    console.error('Sessions API: Error stack:', error.stack);
    return res.status(500).json({
      error: error.message
    });
  }
});

// Get all sessions for the current user
router.get('/', requireUser, async (req, res) => {
  try {
    const sessions = await SessionService.getSessionsByUser(req.user._id);

    return res.status(200).json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

// Get a single session by ID
router.get('/:id', requireUser, async (req, res) => {
  try {
    const session = await SessionService.getSessionById(req.params.id, req.user._id);

    // Get hands for this session to calculate actual profit
    const hands = await HandService.getHandsBySession(req.params.id);
    const calculatedProfit = hands.reduce((sum, hand) => sum + (hand.result || 0), 0);

    // Always return the calculated profit from hands instead of stored profit
    const correctedSession = {
      ...session.toObject(),
      profit: calculatedProfit,
      handsPlayed: hands.length
    };

    return res.status(200).json({
      success: true,
      session: correctedSession
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

// End a session (mark as completed)
router.put('/:id/end', requireUser, async (req, res) => {
  try {
    const session = await SessionService.endSession(req.params.id, req.user._id);

    return res.status(200).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

// Get all hands for a session
router.get('/:id/hands', requireUser, async (req, res) => {
  try {
    const hands = await HandService.getHandsBySession(req.params.id);

    return res.status(200).json({
      success: true,
      hands
    });
  } catch (error) {
    console.error('Error getting hands:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

// Create a new hand for a session
router.post('/:id/hands', requireUser, async (req, res) => {
  try {
    const handData = {
      ...req.body,
      userId: req.user._id
    };

    const hand = await HandService.createHand(req.params.id, handData);

    return res.status(201).json({
      success: true,
      hand
    });
  } catch (error) {
    console.error('Error creating hand:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

// Delete a hand
router.delete('/:sessionId/hands/:handId', requireUser, async (req, res) => {
  try {
    const result = await HandService.deleteHand(req.params.handId);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting hand:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;