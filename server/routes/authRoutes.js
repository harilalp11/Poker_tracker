const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserService = require('../services/userService');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

console.log('Auth Routes: Setting up auth routes');

// Register endpoint
router.post('/register', async (req, res) => {
  console.log('Auth API: POST /api/auth/register');
  console.log('Auth API: Request body keys:', Object.keys(req.body));

  try {
    const { email, password, username } = req.body;

    console.log('Auth API: Registration attempt for email:', email);
    console.log('Auth API: Username provided:', username);

    // Validate required fields
    if (!email || !password || !username) {
      console.log('Auth API: Missing required fields');
      return res.status(400).json({
        error: 'Email, password, and username are required'
      });
    }

    // Check if user already exists
    console.log('Auth API: Checking if user exists with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Auth API: User already exists with email:', email);
      return res.status(400).json({
        error: 'User already exists with this email'
      });
    }

    // Check if username is taken
    console.log('Auth API: Checking if username is taken:', username);
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('Auth API: Username already taken:', username);
      return res.status(400).json({
        error: 'Username is already taken'
      });
    }

    // Create user
    console.log('Auth API: Creating new user');
    const userData = {
      email,
      password,
      username,
      totalProfit: 0,
      preferredStakes: '$1/$2'
    };

    const user = await UserService.createUser(userData);
    console.log('Auth API: User created successfully:', user.email);

    // Generate tokens
    console.log('Auth API: Generating tokens for new user');
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log('Auth API: Registration successful for:', user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        totalProfit: user.totalProfit,
        preferredStakes: user.preferredStakes
      }
    });
  } catch (error) {
    console.error('Auth API: Registration error:', error);
    console.error('Auth API: Registration error stack:', error.stack);
    res.status(500).json({
      error: error.message || 'Registration failed'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  console.log('Auth API: POST /api/auth/login');
  console.log('Auth API: Request body keys:', Object.keys(req.body));

  try {
    const { email, password } = req.body;

    console.log('Auth API: Login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('Auth API: Missing email or password');
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user
    console.log('Auth API: Finding user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Auth API: User not found with email:', email);
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    console.log('Auth API: User found:', user.email);

    // Verify password
    console.log('Auth API: Verifying password');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Auth API: Invalid password for user:', email);
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    console.log('Auth API: Password verified successfully');

    // Generate tokens
    console.log('Auth API: Generating tokens');
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    console.log('Auth API: Login successful for:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        totalProfit: user.totalProfit,
        preferredStakes: user.preferredStakes
      }
    });
  } catch (error) {
    console.error('Auth API: Login error:', error);
    console.error('Auth API: Login error stack:', error.stack);
    res.status(500).json({
      error: error.message || 'Login failed'
    });
  }
});

// Refresh token endpoint - NO MIDDLEWARE
console.log('Auth Routes: Setting up refresh endpoint WITHOUT auth middleware');
router.post('/refresh', async (req, res) => {
  console.log('Auth API: POST /api/auth/refresh - ENTRY POINT');
  console.log('Auth API: Refresh endpoint called without auth middleware');
  console.log('Auth API: Request body:', req.body);

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log('Auth API: No refresh token provided');
      return res.status(401).json({
        error: 'Refresh token is required'
      });
    }

    console.log('Auth API: Verifying refresh token');

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      console.log('Auth API: Refresh token decoded:', { sub: decoded.sub, email: decoded.email });
    } catch (error) {
      console.log('Auth API: Invalid refresh token:', error.message);
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    // Find user
    console.log('Auth API: Finding user with ID:', decoded.sub);
    const user = await UserService.getUserById(decoded.sub);
    if (!user) {
      console.log('Auth API: User not found for refresh token');
      return res.status(401).json({
        error: 'User not found'
      });
    }

    console.log('Auth API: Generating new tokens for user:', user.email);

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    console.log('Auth API: Token refresh successful for:', user.email);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        totalProfit: user.totalProfit,
        preferredStakes: user.preferredStakes
      }
    });
  } catch (error) {
    console.error('Auth API: Token refresh error:', error);
    console.error('Auth API: Token refresh error stack:', error.stack);
    res.status(500).json({
      error: error.message || 'Token refresh failed'
    });
  }
});

// Get current user endpoint
console.log('Auth Routes: Setting up /me endpoint WITH auth middleware');
router.get('/me', requireUser, async (req, res) => {
  console.log('Auth API: GET /api/auth/me');
  console.log('Auth API: User from middleware:', req.user?.email);

  try {
    if (!req.user) {
      console.log('Auth API: No user found in request');
      return res.status(401).json({
        error: 'User not authenticated'
      });
    }

    console.log('Auth API: Returning current user:', req.user.email);

    res.json({
      success: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        totalProfit: req.user.totalProfit,
        preferredStakes: req.user.preferredStakes
      }
    });
  } catch (error) {
    console.error('Auth API: Get current user error:', error);
    console.error('Auth API: Get current user error stack:', error.stack);
    res.status(500).json({
      error: error.message || 'Failed to get current user'
    });
  }
});

// Logout endpoint
console.log('Auth Routes: Setting up /logout endpoint WITH auth middleware');
router.post('/logout', requireUser, async (req, res) => {
  console.log('Auth API: POST /api/auth/logout');
  console.log('Auth API: User logging out:', req.user?.email);

  try {
    // In a more sophisticated implementation, you might want to:
    // 1. Add the refresh token to a blacklist
    // 2. Clear any server-side session data
    // 3. Log the logout event

    console.log('Auth API: Logout successful for:', req.user?.email);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Auth API: Logout error:', error);
    console.error('Auth API: Logout error stack:', error.stack);
    res.status(500).json({
      error: error.message || 'Logout failed'
    });
  }
});

console.log('Auth Routes: All auth routes configured');

module.exports = router;