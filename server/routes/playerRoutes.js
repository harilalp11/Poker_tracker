const express = require('express');
const PlayerService = require('../services/playerService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// Get all players for the authenticated user
router.get('/', requireUser, async (req, res) => {
  console.log('GET /api/players - Getting players for user:', req.user.email);
  
  try {
    const players = await PlayerService.getPlayersByUserId(req.user._id);
    
    console.log('GET /api/players - Successfully retrieved', players.length, 'players');
    return res.status(200).json({
      players: players
    });
  } catch (error) {
    console.error('GET /api/players - Error:', error);
    return res.status(500).json({
      error: error.message
    });
  }
});

// Create a new player
router.post('/', requireUser, async (req, res) => {
  console.log('POST /api/players - Creating player for user:', req.user.email);
  
  try {
    const { name, alias, tags, notes, venue } = req.body;

    // Validate required fields
    if (!name) {
      console.log('POST /api/players - Missing required field: name');
      return res.status(400).json({
        error: 'Player name is required'
      });
    }

    // Validate name length
    if (name.length < 1 || name.length > 100) {
      console.log('POST /api/players - Invalid name length');
      return res.status(400).json({
        error: 'Player name must be between 1 and 100 characters'
      });
    }

    // Validate tags if provided
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.length > 50) {
          console.log('POST /api/players - Invalid tag format');
          return res.status(400).json({
            error: 'Each tag must be a string with maximum 50 characters'
          });
        }
      }
    }

    const playerData = {
      name: name.trim(),
      alias: alias ? alias.trim() : undefined,
      tags: tags || [],
      notes: notes ? notes.trim() : '',
      venue: venue ? venue.trim() : ''
    };

    const player = await PlayerService.createPlayer(req.user._id, playerData);
    
    console.log('POST /api/players - Successfully created player:', player.name);
    return res.status(201).json({
      player: player
    });
  } catch (error) {
    console.error('POST /api/players - Error:', error);
    return res.status(400).json({
      error: error.message
    });
  }
});

// Get a specific player
router.get('/:id', requireUser, async (req, res) => {
  console.log('GET /api/players/:id - Getting player:', req.params.id);
  
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('GET /api/players/:id - Invalid ID format');
      return res.status(400).json({
        error: 'Invalid player ID format'
      });
    }

    const player = await PlayerService.getPlayerById(id, req.user._id);
    
    console.log('GET /api/players/:id - Successfully retrieved player:', player.name);
    return res.status(200).json({
      player: player
    });
  } catch (error) {
    console.error('GET /api/players/:id - Error:', error);
    const statusCode = error.message === 'Player not found' ? 404 : 500;
    return res.status(statusCode).json({
      error: error.message
    });
  }
});

// Update a player
router.put('/:id', requireUser, async (req, res) => {
  console.log('PUT /api/players/:id - Updating player:', req.params.id);
  
  try {
    const { id } = req.params;
    const { name, alias, tags, notes, venue } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('PUT /api/players/:id - Invalid ID format');
      return res.status(400).json({
        error: 'Invalid player ID format'
      });
    }

    // Validate required fields
    if (!name) {
      console.log('PUT /api/players/:id - Missing required field: name');
      return res.status(400).json({
        error: 'Player name is required'
      });
    }

    const updateData = {
      name: name.trim(),
      alias: alias ? alias.trim() : undefined,
      tags: tags || [],
      notes: notes ? notes.trim() : '',
      venue: venue ? venue.trim() : ''
    };

    const player = await PlayerService.updatePlayer(id, req.user._id, updateData);
    
    console.log('PUT /api/players/:id - Successfully updated player:', player.name);
    return res.status(200).json({
      player: player
    });
  } catch (error) {
    console.error('PUT /api/players/:id - Error:', error);
    const statusCode = error.message === 'Player not found' ? 404 : 400;
    return res.status(statusCode).json({
      error: error.message
    });
  }
});

// Delete a player
router.delete('/:id', requireUser, async (req, res) => {
  console.log('DELETE /api/players/:id - Deleting player:', req.params.id);
  
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('DELETE /api/players/:id - Invalid ID format');
      return res.status(400).json({
        error: 'Invalid player ID format'
      });
    }

    await PlayerService.deletePlayer(id, req.user._id);
    
    console.log('DELETE /api/players/:id - Successfully deleted player');
    return res.status(200).json({
      success: true,
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /api/players/:id - Error:', error);
    const statusCode = error.message === 'Player not found' ? 404 : 500;
    return res.status(statusCode).json({
      error: error.message
    });
  }
});

module.exports = router;