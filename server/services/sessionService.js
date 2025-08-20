const Session = require('../models/Session');

class SessionService {
  // Create a new session
  static async createSession(sessionData) {
    try {
      const session = new Session(sessionData);
      const savedSession = await session.save();
      return savedSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  // Get all sessions for a user
  static async getSessionsByUser(userId) {
    try {
      const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
      return sessions;
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw new Error(`Failed to get sessions: ${error.message}`);
    }
  }

  // Get a single session by ID
  static async getSessionById(sessionId, userId) {
    try {
      const session = await Session.findOne({ _id: sessionId, userId });
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      throw new Error(`Failed to get session: ${error.message}`);
    }
  }

  // End a session (mark as completed)
  static async endSession(sessionId, userId) {
    try {
      const session = await Session.findOneAndUpdate(
        { _id: sessionId, userId },
        {
          status: 'completed',
          endTime: new Date()
        },
        { new: true }
      );

      if (!session) {
        throw new Error('Session not found');
      }

      return session;
    } catch (error) {
      console.error('Error ending session:', error);
      throw new Error(`Failed to end session: ${error.message}`);
    }
  }

  // Update a session
  static async updateSession(sessionId, userId, updateData) {
    try {
      const session = await Session.findOneAndUpdate(
        { _id: sessionId, userId },
        updateData,
        { new: true }
      );

      if (!session) {
        throw new Error('Session not found');
      }

      return session;
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error(`Failed to update session: ${error.message}`);
    }
  }

  // Delete a session
  static async deleteSession(sessionId, userId) {
    try {
      const session = await Session.findOneAndDelete({ _id: sessionId, userId });
      if (!session) {
        throw new Error('Session not found');
      }
      return { message: 'Session deleted successfully' };
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }
}

module.exports = SessionService;