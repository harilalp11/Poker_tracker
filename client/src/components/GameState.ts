export interface Player {
  id: string;
  name: string;
  position: string;
  stack: number;
  currentBet: number;
  totalInvested: number;
  isActive: boolean;
  hasActed: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  cards?: string[];
}

export interface GameAction {
  playerId: string;
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
  amount: number;
  round: 'preflop' | 'flop' | 'turn' | 'river';
  timestamp: Date;
}

export interface GameRound {
  name: 'preflop' | 'flop' | 'turn' | 'river';
  actions: GameAction[];
  pot: number;
  currentBet: number;
  isComplete: boolean;
  communityCards?: string[];
}

export interface GameState {
  handId: string;
  players: Player[];
  rounds: GameRound[];
  currentRound: 'preflop' | 'flop' | 'turn' | 'river';
  currentPlayerIndex: number;
  pot: number;
  smallBlind: number;
  bigBlind: number;
  dealerPosition: number;
  communityCards: string[];
  isHandComplete: boolean;
  winner?: string;
  winningAmount?: number;
}

export class GameStateManager {
  private gameState: GameState;

  constructor(players: Player[], smallBlind: number, bigBlind: number, dealerPosition: number) {
    console.log('GameStateManager: Initializing new game state', {
      playersCount: players.length,
      smallBlind,
      bigBlind,
      dealerPosition
    });

    this.gameState = {
      handId: this.generateHandId(),
      players: players.map(player => ({
        ...player,
        currentBet: 0,
        totalInvested: 0,
        isActive: true,
        hasActed: false,
        isFolded: false,
        isAllIn: false
      })),
      rounds: [
        { name: 'preflop', actions: [], pot: 0, currentBet: bigBlind, isComplete: false },
        { name: 'flop', actions: [], pot: 0, currentBet: 0, isComplete: false, communityCards: [] },
        { name: 'turn', actions: [], pot: 0, currentBet: 0, isComplete: false, communityCards: [] },
        { name: 'river', actions: [], pot: 0, currentBet: 0, isComplete: false, communityCards: [] }
      ],
      currentRound: 'preflop',
      currentPlayerIndex: this.getNextPlayerIndex(dealerPosition + 3, players), // UTG starts preflop
      pot: 0,
      smallBlind,
      bigBlind,
      dealerPosition,
      communityCards: [],
      isHandComplete: false
    };

    // Post blinds
    this.postBlinds();
  }

  private generateHandId(): string {
    return `hand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private postBlinds(): void {
    try {
      console.log('GameStateManager: Posting blinds');
      
      const sbIndex = (this.gameState.dealerPosition + 1) % this.gameState.players.length;
      const bbIndex = (this.gameState.dealerPosition + 2) % this.gameState.players.length;

      // Small blind
      const sbPlayer = this.gameState.players[sbIndex];
      sbPlayer.currentBet = this.gameState.smallBlind;
      sbPlayer.totalInvested = this.gameState.smallBlind;
      sbPlayer.stack -= this.gameState.smallBlind;
      this.gameState.pot += this.gameState.smallBlind;

      // Big blind
      const bbPlayer = this.gameState.players[bbIndex];
      bbPlayer.currentBet = this.gameState.bigBlind;
      bbPlayer.totalInvested = this.gameState.bigBlind;
      bbPlayer.stack -= this.gameState.bigBlind;
      this.gameState.pot += this.gameState.bigBlind;

      console.log('GameStateManager: Blinds posted successfully', {
        smallBlind: { player: sbPlayer.name, amount: this.gameState.smallBlind },
        bigBlind: { player: bbPlayer.name, amount: this.gameState.bigBlind },
        pot: this.gameState.pot
      });
    } catch (error) {
      console.error('GameStateManager: Error posting blinds:', error);
      throw new Error('Failed to post blinds');
    }
  }

  private getNextPlayerIndex(startIndex: number, players: Player[]): number {
    for (let i = 0; i < players.length; i++) {
      const index = (startIndex + i) % players.length;
      if (players[index].isActive && !players[index].isFolded && !players[index].isAllIn) {
        return index;
      }
    }
    return -1; // No active players
  }

  public getCurrentPlayer(): Player | null {
    if (this.gameState.currentPlayerIndex === -1) {
      return null;
    }
    return this.gameState.players[this.gameState.currentPlayerIndex];
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public canPlayerAct(playerId: string, action: string, amount?: number): { valid: boolean; error?: string } {
    try {
      const player = this.gameState.players.find(p => p.id === playerId);
      if (!player) {
        return { valid: false, error: 'Player not found' };
      }

      if (!player.isActive || player.isFolded || player.isAllIn) {
        return { valid: false, error: 'Player cannot act' };
      }

      const currentRound = this.gameState.rounds.find(r => r.name === this.gameState.currentRound);
      if (!currentRound) {
        return { valid: false, error: 'Invalid round' };
      }

      switch (action) {
        case 'fold':
          return { valid: true };
        
        case 'check':
          if (player.currentBet < currentRound.currentBet) {
            return { valid: false, error: 'Cannot check, must call or raise' };
          }
          return { valid: true };
        
        case 'call':
          const callAmount = currentRound.currentBet - player.currentBet;
          if (callAmount <= 0) {
            return { valid: false, error: 'Nothing to call' };
          }
          if (callAmount > player.stack) {
            return { valid: false, error: 'Insufficient chips to call' };
          }
          return { valid: true };
        
        case 'bet':
        case 'raise':
          if (!amount || amount <= 0) {
            return { valid: false, error: 'Invalid bet amount' };
          }
          if (amount > player.stack) {
            return { valid: false, error: 'Insufficient chips' };
          }
          const minRaise = currentRound.currentBet * 2;
          if (amount < minRaise && amount < player.stack) {
            return { valid: false, error: `Minimum raise is ${minRaise}` };
          }
          return { valid: true };
        
        case 'all-in':
          return { valid: true };
        
        default:
          return { valid: false, error: 'Invalid action' };
      }
    } catch (error) {
      console.error('GameStateManager: Error validating player action:', error);
      return { valid: false, error: 'Validation error' };
    }
  }

  public executeAction(playerId: string, action: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in', amount?: number): boolean {
    try {
      console.log('GameStateManager: Executing action', { playerId, action, amount });

      const validation = this.canPlayerAct(playerId, action, amount);
      if (!validation.valid) {
        console.error('GameStateManager: Invalid action:', validation.error);
        return false;
      }

      const player = this.gameState.players.find(p => p.id === playerId);
      if (!player) {
        console.error('GameStateManager: Player not found');
        return false;
      }

      const currentRound = this.gameState.rounds.find(r => r.name === this.gameState.currentRound);
      if (!currentRound) {
        console.error('GameStateManager: Current round not found');
        return false;
      }

      // Execute the action
      switch (action) {
        case 'fold':
          player.isFolded = true;
          player.isActive = false;
          break;
        
        case 'check':
          // No chips movement
          break;
        
        case 'call':
          const callAmount = currentRound.currentBet - player.currentBet;
          player.stack -= callAmount;
          player.currentBet = currentRound.currentBet;
          player.totalInvested += callAmount;
          this.gameState.pot += callAmount;
          break;
        
        case 'bet':
        case 'raise':
          if (amount) {
            const totalBet = player.currentBet + amount;
            player.stack -= amount;
            player.currentBet = totalBet;
            player.totalInvested += amount;
            this.gameState.pot += amount;
            currentRound.currentBet = Math.max(currentRound.currentBet, totalBet);
          }
          break;
        
        case 'all-in':
          const allInAmount = player.stack;
          player.stack = 0;
          player.currentBet += allInAmount;
          player.totalInvested += allInAmount;
          player.isAllIn = true;
          this.gameState.pot += allInAmount;
          currentRound.currentBet = Math.max(currentRound.currentBet, player.currentBet);
          break;
      }

      // Record the action
      const gameAction: GameAction = {
        playerId,
        action,
        amount: amount || 0,
        round: this.gameState.currentRound,
        timestamp: new Date()
      };
      currentRound.actions.push(gameAction);

      player.hasActed = true;

      // Move to next player
      this.moveToNextPlayer();

      // Check if round is complete
      if (this.isRoundComplete()) {
        this.completeRound();
      }

      console.log('GameStateManager: Action executed successfully', {
        action,
        player: player.name,
        pot: this.gameState.pot,
        currentRound: this.gameState.currentRound
      });

      return true;
    } catch (error) {
      console.error('GameStateManager: Error executing action:', error);
      return false;
    }
  }

  private moveToNextPlayer(): void {
    try {
      const activePlayers = this.gameState.players.filter(p => p.isActive && !p.isFolded && !p.isAllIn);
      if (activePlayers.length <= 1) {
        this.gameState.currentPlayerIndex = -1;
        return;
      }

      let nextIndex = (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
      while (nextIndex !== this.gameState.currentPlayerIndex) {
        const player = this.gameState.players[nextIndex];
        if (player.isActive && !player.isFolded && !player.isAllIn) {
          this.gameState.currentPlayerIndex = nextIndex;
          return;
        }
        nextIndex = (nextIndex + 1) % this.gameState.players.length;
      }

      this.gameState.currentPlayerIndex = -1;
    } catch (error) {
      console.error('GameStateManager: Error moving to next player:', error);
      this.gameState.currentPlayerIndex = -1;
    }
  }

  private isRoundComplete(): boolean {
    try {
      const activePlayers = this.gameState.players.filter(p => p.isActive && !p.isFolded);
      
      if (activePlayers.length <= 1) {
        return true;
      }

      const currentRound = this.gameState.rounds.find(r => r.name === this.gameState.currentRound);
      if (!currentRound) {
        return false;
      }

      // Check if all active players have acted and matched the current bet
      return activePlayers.every(player => 
        player.hasActed && 
        (player.currentBet === currentRound.currentBet || player.isAllIn)
      );
    } catch (error) {
      console.error('GameStateManager: Error checking if round is complete:', error);
      return false;
    }
  }

  private completeRound(): void {
    try {
      console.log('GameStateManager: Completing round:', this.gameState.currentRound);

      const currentRound = this.gameState.rounds.find(r => r.name === this.gameState.currentRound);
      if (currentRound) {
        currentRound.isComplete = true;
        currentRound.pot = this.gameState.pot;
      }

      // Reset player states for next round
      this.gameState.players.forEach(player => {
        player.hasActed = false;
        player.currentBet = 0;
      });

      // Move to next round
      const roundOrder: ('preflop' | 'flop' | 'turn' | 'river')[] = ['preflop', 'flop', 'turn', 'river'];
      const currentRoundIndex = roundOrder.indexOf(this.gameState.currentRound);
      
      if (currentRoundIndex < roundOrder.length - 1) {
        this.gameState.currentRound = roundOrder[currentRoundIndex + 1];
        
        // Set first player to act (left of dealer)
        this.gameState.currentPlayerIndex = this.getNextPlayerIndex(
          (this.gameState.dealerPosition + 1) % this.gameState.players.length,
          this.gameState.players
        );

        console.log('GameStateManager: Advanced to round:', this.gameState.currentRound);
      } else {
        // Hand is complete
        this.gameState.isHandComplete = true;
        this.gameState.currentPlayerIndex = -1;
        console.log('GameStateManager: Hand completed');
      }
    } catch (error) {
      console.error('GameStateManager: Error completing round:', error);
      throw new Error('Failed to complete round');
    }
  }

  public setCommunityCards(cards: string[]): void {
    try {
      console.log('GameStateManager: Setting community cards for round:', this.gameState.currentRound, cards);
      
      this.gameState.communityCards = [...cards];
      
      const currentRound = this.gameState.rounds.find(r => r.name === this.gameState.currentRound);
      if (currentRound) {
        currentRound.communityCards = [...cards];
      }
    } catch (error) {
      console.error('GameStateManager: Error setting community cards:', error);
      throw new Error('Failed to set community cards');
    }
  }

  public setPlayerCards(playerId: string, cards: string[]): void {
    try {
      const player = this.gameState.players.find(p => p.id === playerId);
      if (player) {
        player.cards = [...cards];
        console.log('GameStateManager: Set cards for player:', player.name);
      } else {
        console.error('GameStateManager: Player not found when setting cards:', playerId);
      }
    } catch (error) {
      console.error('GameStateManager: Error setting player cards:', error);
      throw new Error('Failed to set player cards');
    }
  }

  public getHandSummary(): any {
    try {
      return {
        handId: this.gameState.handId,
        players: this.gameState.players.map(p => ({
          id: p.id,
          name: p.name,
          position: p.position,
          totalInvested: p.totalInvested,
          finalStack: p.stack,
          cards: p.cards
        })),
        rounds: this.gameState.rounds.map(r => ({
          name: r.name,
          actions: r.actions,
          communityCards: r.communityCards,
          pot: r.pot
        })),
        finalPot: this.gameState.pot,
        communityCards: this.gameState.communityCards,
        winner: this.gameState.winner,
        winningAmount: this.gameState.winningAmount
      };
    } catch (error) {
      console.error('GameStateManager: Error generating hand summary:', error);
      throw new Error('Failed to generate hand summary');
    }
  }

  public setWinner(playerId: string, amount: number): void {
    try {
      const player = this.gameState.players.find(p => p.id === playerId);
      if (player) {
        this.gameState.winner = player.name;
        this.gameState.winningAmount = amount;
        player.stack += amount;
        console.log('GameStateManager: Winner set:', player.name, 'Amount:', amount);
      } else {
        console.error('GameStateManager: Winner player not found:', playerId);
      }
    } catch (error) {
      console.error('GameStateManager: Error setting winner:', error);
      throw new Error('Failed to set winner');
    }
  }
}