const Player = require('../models/Player');

class PlayerService {
  // Get all players for a user
  static async getPlayersByUserId(userId) {
    console.log('PlayerService: Getting players for user:', userId);
    try {
      const players = await Player.find({ userId }).sort({ lastSeen: -1 });
      console.log('PlayerService: Successfully retrieved', players.length, 'players');
      return players;
    } catch (error) {
      console.error('PlayerService: Error getting players:', error);
      throw new Error(`Failed to get players: ${error.message}`);
    }
  }

  // Create a new player
  static async createPlayer(userId, playerData) {
    console.log('PlayerService: Creating player for user:', userId);
    try {
      // Check if player with same name already exists for this user
      const existingPlayer = await Player.findOne({ 
        userId, 
        name: playerData.name 
      });
      
      if (existingPlayer) {
        throw new Error('Player with this name already exists');
      }

      const player = new Player({
        userId,
        ...playerData,
        lastSeen: new Date()
      });

      const savedPlayer = await player.save();
      console.log('PlayerService: Successfully created player:', savedPlayer.name);
      return savedPlayer;
    } catch (error) {
      console.error('PlayerService: Error creating player:', error);
      throw new Error(`Failed to create player: ${error.message}`);
    }
  }

  // Get player by ID
  static async getPlayerById(playerId, userId) {
    console.log('PlayerService: Getting player by ID:', playerId);
    try {
      const player = await Player.findOne({ _id: playerId, userId });
      if (!player) {
        throw new Error('Player not found');
      }
      console.log('PlayerService: Successfully retrieved player:', player.name);
      return player;
    } catch (error) {
      console.error('PlayerService: Error getting player by ID:', error);
      throw new Error(`Failed to get player: ${error.message}`);
    }
  }

  // Update player
  static async updatePlayer(playerId, userId, updateData) {
    console.log('PlayerService: Updating player:', playerId);
    try {
      const player = await Player.findOneAndUpdate(
        { _id: playerId, userId },
        { ...updateData, lastSeen: new Date() },
        { new: true, runValidators: true }
      );

      if (!player) {
        throw new Error('Player not found');
      }

      console.log('PlayerService: Successfully updated player:', player.name);
      return player;
    } catch (error) {
      console.error('PlayerService: Error updating player:', error);
      throw new Error(`Failed to update player: ${error.message}`);
    }
  }

  // Delete player
  static async deletePlayer(playerId, userId) {
    console.log('PlayerService: Deleting player:', playerId);
    try {
      const player = await Player.findOneAndDelete({ _id: playerId, userId });
      if (!player) {
        throw new Error('Player not found');
      }
      console.log('PlayerService: Successfully deleted player:', player.name);
      return player;
    } catch (error) {
      console.error('PlayerService: Error deleting player:', error);
      throw new Error(`Failed to delete player: ${error.message}`);
    }
  }

  // Update player statistics (for future use when hands are played)
  static async updatePlayerStats(playerId, userId, statsUpdate) {
    console.log('PlayerService: Updating player stats:', playerId);
    try {
      const player = await Player.findOneAndUpdate(
        { _id: playerId, userId },
        { 
          $inc: { 
            handsPlayed: statsUpdate.handsPlayed || 0,
            profitAgainst: statsUpdate.profitAgainst || 0
          },
          $set: {
            winRateAgainst: statsUpdate.winRateAgainst,
            playingStyle: statsUpdate.playingStyle,
            lastSeen: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!player) {
        throw new Error('Player not found');
      }

      console.log('PlayerService: Successfully updated player stats:', player.name);
      return player;
    } catch (error) {
      console.error('PlayerService: Error updating player stats:', error);
      throw new Error(`Failed to update player stats: ${error.message}`);
    }
  }
}

module.exports = PlayerService;