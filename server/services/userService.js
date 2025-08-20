const User = require('../models/User');
const bcrypt = require('bcrypt');

class UserService {
  // Create a new user
  static async createUser(userData) {
    console.log('UserService: Creating user with email:', userData.email);
    try {
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await user.save();
      console.log('UserService: User created successfully:', savedUser.email);
      return savedUser;
    } catch (error) {
      console.error('UserService: Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    console.log('UserService: Getting user by ID:', userId);
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log('UserService: User not found with ID:', userId);
        return null;
      }
      console.log('UserService: Successfully retrieved user:', user.email);
      return user;
    } catch (error) {
      console.error('UserService: Error getting user by ID:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  // Get user by email
  static async getUserByEmail(email) {
    console.log('UserService: Getting user by email:', email);
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log('UserService: User not found with email:', email);
        return null;
      }
      console.log('UserService: Successfully retrieved user:', user.email);
      return user;
    } catch (error) {
      console.error('UserService: Error getting user by email:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  // Update user
  static async updateUser(userId, updateData) {
    console.log('UserService: Updating user:', userId);
    try {
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
      if (!user) {
        console.log('UserService: User not found for update:', userId);
        throw new Error('User not found');
      }
      console.log('UserService: User updated successfully:', user.email);
      return user;
    } catch (error) {
      console.error('UserService: Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user
  static async deleteUser(userId) {
    console.log('UserService: Deleting user:', userId);
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        console.log('UserService: User not found for deletion:', userId);
        throw new Error('User not found');
      }
      console.log('UserService: User deleted successfully:', user.email);
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('UserService: Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Verify user password
  static async verifyPassword(userId, password) {
    console.log('UserService: Verifying password for user:', userId);
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log('UserService: User not found for password verification:', userId);
        return false;
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      console.log('UserService: Password verification result:', isValid);
      return isValid;
    } catch (error) {
      console.error('UserService: Error verifying password:', error);
      throw new Error(`Failed to verify password: ${error.message}`);
    }
  }
}

module.exports = UserService;