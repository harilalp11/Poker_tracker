// Poker game rules and validation utilities
export interface PokerAction {
  type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
  amount?: number;
  playerId: string;
  round: 'preflop' | 'flop' | 'turn' | 'river';
}

export interface Player {
  id: string;
  name: string;
  position: string;
  stack: number;
  currentBet: number;
  isActive: boolean;
  hasActed: boolean;
  isFolded: boolean;
  isAllIn: boolean;
}

export interface GameState {
  round: 'preflop' | 'flop' | 'turn' | 'river';
  pot: number;
  currentBet: number;
  activePlayerIndex: number;
  players: Player[];
  smallBlind: number;
  bigBlind: number;
  dealerPosition: number;
  actions: PokerAction[];
}

export class PokerRules {
  static readonly POSITIONS = ['UTG', 'UTG+1', 'MP1', 'MP2', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
  
  static validateAction(action: PokerAction, gameState: GameState, player: Player): boolean {
    try {
      console.log(`Validating action: ${action.type} for player ${player.name} in round ${action.round}`);
      
      if (player.isFolded || !player.isActive) {
        console.log(`Player ${player.name} cannot act - folded or inactive`);
        return false;
      }

      const currentBet = gameState.currentBet;
      const playerBet = player.currentBet;
      const callAmount = currentBet - playerBet;

      switch (action.type) {
        case 'fold':
          return true;
          
        case 'check':
          return callAmount === 0;
          
        case 'call':
          return callAmount > 0 && player.stack >= callAmount;
          
        case 'bet':
          if (currentBet > 0) return false; // Can't bet if there's already a bet
          return action.amount && action.amount > 0 && player.stack >= action.amount;
          
        case 'raise':
          if (currentBet === 0) return false; // Can't raise if no bet
          const minRaise = currentBet * 2 - playerBet;
          return action.amount && action.amount >= minRaise && player.stack >= (action.amount - playerBet);
          
        case 'all-in':
          return player.stack > 0;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Error validating poker action:', error);
      return false;
    }
  }

  static getValidActions(gameState: GameState, player: Player): string[] {
    try {
      console.log(`Getting valid actions for player ${player.name} in round ${gameState.round}`);
      
      if (player.isFolded || !player.isActive) {
        return [];
      }

      const validActions: string[] = ['fold'];
      const currentBet = gameState.currentBet;
      const playerBet = player.currentBet;
      const callAmount = currentBet - playerBet;

      if (callAmount === 0) {
        validActions.push('check');
        if (player.stack > 0) {
          validActions.push('bet');
        }
      } else {
        if (player.stack >= callAmount) {
          validActions.push('call');
        }
        if (player.stack > callAmount) {
          validActions.push('raise');
        }
      }

      if (player.stack > 0) {
        validActions.push('all-in');
      }

      console.log(`Valid actions for ${player.name}: ${validActions.join(', ')}`);
      return validActions;
    } catch (error) {
      console.error('Error getting valid actions:', error);
      return ['fold'];
    }
  }

  static applyAction(action: PokerAction, gameState: GameState): GameState {
    try {
      console.log(`Applying action: ${action.type} by player ${action.playerId}`);
      
      const newGameState = { ...gameState };
      const player = newGameState.players.find(p => p.id === action.playerId);
      
      if (!player) {
        console.error(`Player ${action.playerId} not found`);
        return gameState;
      }

      switch (action.type) {
        case 'fold':
          player.isFolded = true;
          player.isActive = false;
          break;
          
        case 'check':
          // No money movement
          break;
          
        case 'call':
          const callAmount = newGameState.currentBet - player.currentBet;
          player.stack -= callAmount;
          player.currentBet = newGameState.currentBet;
          newGameState.pot += callAmount;
          break;
          
        case 'bet':
          if (action.amount) {
            player.stack -= action.amount;
            player.currentBet = action.amount;
            newGameState.currentBet = action.amount;
            newGameState.pot += action.amount;
          }
          break;
          
        case 'raise':
          if (action.amount) {
            const raiseAmount = action.amount - player.currentBet;
            player.stack -= raiseAmount;
            player.currentBet = action.amount;
            newGameState.currentBet = action.amount;
            newGameState.pot += raiseAmount;
          }
          break;
          
        case 'all-in':
          const allInAmount = player.stack;
          player.stack = 0;
          player.currentBet += allInAmount;
          player.isAllIn = true;
          newGameState.pot += allInAmount;
          if (player.currentBet > newGameState.currentBet) {
            newGameState.currentBet = player.currentBet;
          }
          break;
      }

      player.hasActed = true;
      newGameState.actions.push(action);
      
      console.log(`Action applied. Pot: ${newGameState.pot}, Current bet: ${newGameState.currentBet}`);
      return newGameState;
    } catch (error) {
      console.error('Error applying poker action:', error);
      return gameState;
    }
  }

  static isRoundComplete(gameState: GameState): boolean {
    try {
      const activePlayers = gameState.players.filter(p => p.isActive && !p.isFolded);
      
      // If only one player left, round is complete
      if (activePlayers.length <= 1) {
        return true;
      }

      // Check if all active players have acted and matched the current bet
      const allActed = activePlayers.every(p => p.hasActed || p.isAllIn);
      const allMatched = activePlayers.every(p => 
        p.currentBet === gameState.currentBet || p.isAllIn || p.stack === 0
      );

      const isComplete = allActed && allMatched;
      console.log(`Round complete check: ${isComplete} (all acted: ${allActed}, all matched: ${allMatched})`);
      
      return isComplete;
    } catch (error) {
      console.error('Error checking if round is complete:', error);
      return false;
    }
  }

  static getNextPlayer(gameState: GameState): number {
    try {
      const activePlayers = gameState.players.filter(p => p.isActive && !p.isFolded && !p.isAllIn);
      
      if (activePlayers.length === 0) {
        return -1;
      }

      let nextIndex = (gameState.activePlayerIndex + 1) % gameState.players.length;
      
      // Find next active player who hasn't folded and isn't all-in
      while (nextIndex !== gameState.activePlayerIndex) {
        const player = gameState.players[nextIndex];
        if (player.isActive && !player.isFolded && !player.isAllIn) {
          console.log(`Next player: ${player.name} at index ${nextIndex}`);
          return nextIndex;
        }
        nextIndex = (nextIndex + 1) % gameState.players.length;
      }

      return gameState.activePlayerIndex;
    } catch (error) {
      console.error('Error getting next player:', error);
      return gameState.activePlayerIndex;
    }
  }

  static advanceToNextRound(gameState: GameState): GameState {
    try {
      console.log(`Advancing from ${gameState.round} to next round`);
      
      const newGameState = { ...gameState };
      
      // Reset player states for new round
      newGameState.players.forEach(player => {
        player.hasActed = false;
        player.currentBet = 0;
      });
      
      newGameState.currentBet = 0;
      
      // Advance round
      switch (gameState.round) {
        case 'preflop':
          newGameState.round = 'flop';
          break;
        case 'flop':
          newGameState.round = 'turn';
          break;
        case 'turn':
          newGameState.round = 'river';
          break;
        case 'river':
          // Hand is complete
          console.log('Hand complete after river');
          break;
      }
      
      // Set first active player for new round (usually first active player after dealer)
      const activePlayers = newGameState.players.filter(p => p.isActive && !p.isFolded);
      if (activePlayers.length > 0) {
        newGameState.activePlayerIndex = newGameState.players.findIndex(p => 
          p.isActive && !p.isFolded
        );
      }
      
      console.log(`Advanced to ${newGameState.round}`);
      return newGameState;
    } catch (error) {
      console.error('Error advancing to next round:', error);
      return gameState;
    }
  }

  static initializeGameState(players: Player[], smallBlind: number, bigBlind: number, dealerPosition: number): GameState {
    try {
      console.log(`Initializing game state with ${players.length} players, SB: ${smallBlind}, BB: ${bigBlind}`);
      
      const gameState: GameState = {
        round: 'preflop',
        pot: smallBlind + bigBlind,
        currentBet: bigBlind,
        activePlayerIndex: (dealerPosition + 3) % players.length, // UTG starts preflop
        players: players.map((player, index) => ({
          ...player,
          hasActed: false,
          isFolded: false,
          isAllIn: false,
          isActive: true,
          currentBet: 0
        })),
        smallBlind,
        bigBlind,
        dealerPosition,
        actions: []
      };

      // Set blinds
      const sbIndex = (dealerPosition + 1) % players.length;
      const bbIndex = (dealerPosition + 2) % players.length;
      
      gameState.players[sbIndex].currentBet = smallBlind;
      gameState.players[sbIndex].stack -= smallBlind;
      
      gameState.players[bbIndex].currentBet = bigBlind;
      gameState.players[bbIndex].stack -= bigBlind;
      
      console.log('Game state initialized successfully');
      return gameState;
    } catch (error) {
      console.error('Error initializing game state:', error);
      throw new Error('Failed to initialize game state');
    }
  }

  static calculateMinBet(gameState: GameState): number {
    return gameState.bigBlind;
  }

  static calculateMinRaise(gameState: GameState): number {
    return gameState.currentBet * 2;
  }

  static isHandComplete(gameState: GameState): boolean {
    const activePlayers = gameState.players.filter(p => !p.isFolded);
    return activePlayers.length <= 1 || gameState.round === 'river' && this.isRoundComplete(gameState);
  }
}