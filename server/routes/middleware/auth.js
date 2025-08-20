const jwt = require('jsonwebtoken');
const UserService = require('../../services/userService');

const requireUser = async (req, res, next) => {
  console.log('Auth middleware: Starting authentication check');
  console.log('Auth middleware: Request URL:', req.originalUrl);
  console.log('Auth middleware: Request method:', req.method);
  console.log('Auth middleware: Headers received:', req.headers);

  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware: Authorization header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware: No valid authorization header found');
      return res.status(401).json({
        error: 'Access token is required'
      });
    }

    const token = authHeader.substring(7);
    console.log('Auth middleware: Token extracted');
    console.log('Auth middleware: Token length:', token.length);

    console.log('Auth middleware: Attempting to verify token');
    console.log('Auth middleware: Using ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? 'Set' : 'Not set');
    console.log('Auth middleware: Current server time:', new Date().toISOString());
    console.log('Auth middleware: Current server timestamp:', Math.floor(Date.now() / 1000));

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('Auth middleware: Token verified successfully');
    console.log('Auth middleware: Decoded token:', { sub: decoded.sub, email: decoded.email, exp: decoded.exp });

    const user = await UserService.getUserById(decoded.sub);
    console.log('Auth middleware: User lookup result:', user ? 'Found' : 'Not found');

    if (!user) {
      console.log('Auth middleware: User not found for token');
      return res.status(401).json({
        error: 'User not found'
      });
    }

    console.log('Auth middleware: Authentication successful for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware: Authentication error:', error);

    if (error.name === 'TokenExpiredError') {
      console.log('Auth middleware: Token has expired');
      console.log('Auth middleware: Token expired at:', error.expiredAt);
      console.log('Auth middleware: Current time:', new Date().toISOString());
      console.log('Auth middleware: Error name:', error.name);
      console.log('Auth middleware: Error message:', error.message);
    }

    return res.status(401).json({
      error: 'Invalid or expired token'
    });
  }
};

module.exports = {
  requireUser
};