const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  console.log('Auth utils: Generating access token for user:', user.email);
  console.log('Auth utils: User ID:', user._id);
  console.log('Auth utils: ACCESS_TOKEN_SECRET exists:', !!process.env.ACCESS_TOKEN_SECRET);
  
  try {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username
    };
    
    console.log('Auth utils: Token payload:', payload);
    
    const options = {
      expiresIn: '1h',
      issuer: 'PokerTrack'
    };
    
    console.log('Auth utils: Token options:', options);
    console.log('Auth utils: About to sign token with JWT');
    
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, options);
    
    console.log('Auth utils: Access token generated successfully');
    console.log('Auth utils: Token length:', token.length);
    console.log('Auth utils: Token starts with:', token.substring(0, 50) + '...');
    
    return token;
  } catch (error) {
    console.error('Auth utils: Error generating access token:', error);
    console.error('Auth utils: Error stack:', error.stack);
    throw error;
  }
};

const generateRefreshToken = (user) => {
  console.log('Auth utils: Generating refresh token for user:', user.email);
  console.log('Auth utils: REFRESH_TOKEN_SECRET exists:', !!process.env.REFRESH_TOKEN_SECRET);
  
  try {
    const payload = {
      sub: user._id.toString(),
      email: user.email
    };
    
    console.log('Auth utils: Refresh token payload:', payload);
    
    const options = {
      expiresIn: '7d',
      issuer: 'PokerTrack'
    };
    
    console.log('Auth utils: Refresh token options:', options);
    
    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, options);
    
    console.log('Auth utils: Refresh token generated successfully');
    console.log('Auth utils: Refresh token length:', token.length);
    
    return token;
  } catch (error) {
    console.error('Auth utils: Error generating refresh token:', error);
    console.error('Auth utils: Error stack:', error.stack);
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};