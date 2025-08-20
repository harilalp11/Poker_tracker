const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  console.log('Password utils: Hashing password');
  console.log('Password utils: Password provided:', !!password);
  console.log('Password utils: Password type:', typeof password);
  console.log('Password utils: Password length:', password?.length);
  
  if (!password) {
    throw new Error('Password is required for hashing');
  }
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Password utils: Password hashed successfully');
  console.log('Password utils: Hash length:', hashedPassword?.length);
  return hashedPassword;
};

const comparePassword = async (password, hash) => {
  console.log('Password utils: Comparing password');
  console.log('Password utils: Password provided:', !!password);
  console.log('Password utils: Password type:', typeof password);
  console.log('Password utils: Password length:', password?.length);
  console.log('Password utils: Hash provided:', !!hash);
  console.log('Password utils: Hash type:', typeof hash);
  console.log('Password utils: Hash length:', hash?.length);
  console.log('Password utils: Hash preview:', hash?.substring(0, 20) + '...');
  
  if (!password) {
    console.error('Password utils: Password is null/undefined');
    throw new Error('Password is required for comparison');
  }
  
  if (!hash) {
    console.error('Password utils: Hash is null/undefined');
    throw new Error('Hash is required for comparison');
  }
  
  if (typeof password !== 'string') {
    console.error('Password utils: Password is not a string:', typeof password);
    throw new Error('Password must be a string');
  }
  
  if (typeof hash !== 'string') {
    console.error('Password utils: Hash is not a string:', typeof hash);
    throw new Error('Hash must be a string');
  }
  
  try {
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Password utils: Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Password utils: bcrypt.compare error:', error);
    throw new Error(`Failed to compare password: ${error.message}`);
  }
};

module.exports = {
  hashPassword,
  comparePassword
};