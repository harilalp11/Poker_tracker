const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser } = require('./middleware/auth.js');

const router = express.Router();

// Create a new user
router.post('/', async (req, res) => {
  console.log('POST /api/users - Creating new user');
  
  try {
    const { email, password, username, totalProfit, preferredStakes } = req.body;
    
    // Validate required fields
    if (!email || !password || !username) {
      console.log('POST /api/users - Missing required fields');
      return res.status(400).json({ 
        error: 'Email, password, and username are required' 
      });
    }

    // Validate username format
    if (username.length < 3 || username.length > 30) {
      console.log('POST /api/users - Invalid username length');
      return res.status(400).json({ 
        error: 'Username must be between 3 and 30 characters' 
      });
    }

    // Validate totalProfit if provided
    if (totalProfit !== undefined && typeof totalProfit !== 'number') {
      console.log('POST /api/users - Invalid totalProfit type');
      return res.status(400).json({ 
        error: 'Total profit must be a number' 
      });
    }

    const user = await UserService.create({
      email,
      password,
      username,
      totalProfit,
      preferredStakes
    });

    console.log(`POST /api/users - Successfully created user: ${user.email}`);
    return res.status(201).json(user);
    
  } catch (error) {
    console.error('POST /api/users - Error creating user:', error);
    return res.status(400).json({ 
      error: error.message 
    });
  }
});

// Get user by ID
router.get('/:id', requireUser, async (req, res) => {
  console.log(`GET /api/users/${req.params.id} - Starting request`);
  console.log(`GET /api/users/${req.params.id} - Request headers:`, req.headers);
  console.log(`GET /api/users/${req.params.id} - Authenticated user:`, req.user ? req.user.email : 'None');

  try {
    const { id } = req.params;
    console.log(`GET /api/users/${id} - Requested user ID: ${id}`);
    
    // Validate ID format (basic MongoDB ObjectId validation)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`GET /api/users/${id} - Invalid ID format`);
      return res.status(400).json({ 
        error: 'Invalid user ID format' 
      });
    }

    const user = await UserService.get(id);
    
    if (!user) {
      console.log(`GET /api/users/${id} - User not found`);
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    console.log(`GET /api/users/${id} - Successfully retrieved user: ${user.email}`);
    return res.status(200).json(user);
    
  } catch (error) {
    console.error(`GET /api/users/${req.params.id} - Error retrieving user:`, error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
});

module.exports = router;