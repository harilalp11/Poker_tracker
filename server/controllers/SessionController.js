const SessionService = require('../services/sessionService');

class SessionController {
  async createSession(req, res) {
    try {
      console.log('SessionController: Creating new session');
      console.log('SessionController: Request body:', JSON.stringify(req.body, null, 2));
      console.log('SessionController: User ID from auth:', req.user?.id);

      if (!req.user?.id) {
        console.error('SessionController: No user ID found in request');
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }

      // Validate required fields
      const requiredFields = ['date', 'venue', 'stakes', 'gameType', 'tableSize', 'buyIn', 'cashOut'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        console.error('SessionController: Missing required fields:', missingFields);
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const sessionData = {
        ...req.body,
        userId: req.user.id
      };

      console.log('SessionController: Processed session data:', JSON.stringify(sessionData, null, 2));

      const session = await SessionService.createSession(sessionData);
      
      console.log('SessionController: Session created successfully:', session._id);
      
      res.status(201).json({
        success: true,
        session
      });
    } catch (error) {
      console.error('SessionController: Error creating session:', error);
      console.error('SessionController: Full error stack:', error.stack);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create session'
      });
    }
  }

  async getAllSessions(req, res) {
    try {
      console.log('SessionController: Getting all sessions for user:', req.user?.id);

      if (!req.user?.id) {
        console.error('SessionController: No user ID found in request');
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }

      const sessions = await SessionService.getAllSessions(req.user.id);
      
      console.log('SessionController: Retrieved sessions count:', sessions.length);
      
      res.json({
        success: true,
        sessions
      });
    } catch (error) {
      console.error('SessionController: Error getting sessions:', error);
      console.error('SessionController: Full error stack:', error.stack);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve sessions'
      });
    }
  }

  async getSessionById(req, res) {
    try {
      console.log('SessionController: Getting session by ID:', req.params.id);
      console.log('SessionController: User ID from auth:', req.user?.id);

      if (!req.user?.id) {
        console.error('SessionController: No user ID found in request');
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }

      if (!req.params.id) {
        console.error('SessionController: No session ID provided');
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const session = await SessionService.getSessionById(req.params.id, req.user.id);
      
      if (!session) {
        console.log('SessionController: Session not found or access denied');
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      console.log('SessionController: Session retrieved successfully:', session._id);
      
      res.json({
        success: true,
        session
      });
    } catch (error) {
      console.error('SessionController: Error getting session by ID:', error);
      console.error('SessionController: Full error stack:', error.stack);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve session'
      });
    }
  }

  async updateSession(req, res) {
    try {
      console.log('SessionController: Updating session:', req.params.id);
      console.log('SessionController: Update data:', JSON.stringify(req.body, null, 2));
      console.log('SessionController: User ID from auth:', req.user?.id);

      if (!req.user?.id) {
        console.error('SessionController: No user ID found in request');
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }

      if (!req.params.id) {
        console.error('SessionController: No session ID provided');
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const session = await SessionService.updateSession(req.params.id, req.body, req.user.id);
      
      if (!session) {
        console.log('SessionController: Session not found or access denied for update');
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      console.log('SessionController: Session updated successfully:', session._id);
      
      res.json({
        success: true,
        session
      });
    } catch (error) {
      console.error('SessionController: Error updating session:', error);
      console.error('SessionController: Full error stack:', error.stack);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update session'
      });
    }
  }

  async deleteSession(req, res) {
    try {
      console.log('SessionController: Deleting session:', req.params.id);
      console.log('SessionController: User ID from auth:', req.user?.id);

      if (!req.user?.id) {
        console.error('SessionController: No user ID found in request');
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }

      if (!req.params.id) {
        console.error('SessionController: No session ID provided');
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const deleted = await SessionService.deleteSession(req.params.id, req.user.id);
      
      if (!deleted) {
        console.log('SessionController: Session not found or access denied for deletion');
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      console.log('SessionController: Session deleted successfully:', req.params.id);
      
      res.json({
        success: true,
        message: 'Session deleted successfully'
      });
    } catch (error) {
      console.error('SessionController: Error deleting session:', error);
      console.error('SessionController: Full error stack:', error.stack);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete session'
      });
    }
  }
}

module.exports = new SessionController();