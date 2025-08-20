import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { createHand } from '@/api/hands';

interface Player {
  id: string;
  name: string;
  position: string;
  stack: number;
  currentBet: number;
  totalInvested: number;
  folded: boolean;
  allIn: boolean;
  cards?: string[];
}

interface Action {
  playerId: string;
  playerName: string;
  action: 'fold' | 'call' | 'raise' | 'check' | 'bet' | 'all-in';
  amount: number;
  round: 'preflop' | 'flop' | 'turn' | 'river';
}

interface HandData {
  sessionId: string;
  position: string;
  holeCards: string[];
  communityCards: string[];
  actions: Action[];
  potSize: number;
  result: 'win' | 'loss' | 'split';
  amountWon: number;
  showdown: boolean;
}

const POSITIONS = ['UTG', 'UTG+1', 'MP1', 'MP2', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
const POKER_ACTIONS = ['fold', 'call', 'raise', 'check', 'bet', 'all-in'];
const ROUNDS = ['preflop', 'flop', 'turn', 'river'];

interface HandRecorderProps {
  sessionId: string;
  onHandRecorded: () => void;
}

export const HandRecorder: React.FC<HandRecorderProps> = ({ sessionId, onHandRecorded }) => {
  console.log('HandRecorder: Component initializing with sessionId:', sessionId);

  const [currentRound, setCurrentRound] = useState<'preflop' | 'flop' | 'turn' | 'river'>('preflop');
  const [players, setPlayers] = useState<Player[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [potSize, setPotSize] = useState(0);
  const [communityCards, setCommunityCards] = useState<string[]>([]);
  const [holeCards, setHoleCards] = useState<string[]>(['', '']);
  const [heroPosition, setHeroPosition] = useState<string>('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [handResult, setHandResult] = useState<'win' | 'loss' | 'split'>('loss');
  const [amountWon, setAmountWon] = useState(0);
  const [showdown, setShowdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [handStarted, setHandStarted] = useState(false);

  // Initialize players for a 6-max table
  useEffect(() => {
    console.log('HandRecorder: Initializing default players');
    const defaultPlayers: Player[] = [
      { id: '1', name: 'Player 1', position: 'UTG', stack: 200, currentBet: 0, totalInvested: 0, folded: false, allIn: false },
      { id: '2', name: 'Player 2', position: 'HJ', stack: 200, currentBet: 0, totalInvested: 0, folded: false, allIn: false },
      { id: '3', name: 'Player 3', position: 'CO', stack: 200, currentBet: 0, totalInvested: 0, folded: false, allIn: false },
      { id: '4', name: 'Player 4', position: 'BTN', stack: 200, currentBet: 0, totalInvested: 0, folded: false, allIn: false },
      { id: '5', name: 'Player 5', position: 'SB', stack: 200, currentBet: 1, totalInvested: 1, folded: false, allIn: false },
      { id: '6', name: 'Hero', position: 'BB', stack: 200, currentBet: 2, totalInvested: 2, folded: false, allIn: false },
    ];
    setPlayers(defaultPlayers);
    setPotSize(3); // SB + BB
    setHeroPosition('BB');
  }, []);

  const handlePlayerAction = (playerId: string, action: string, amount: number = 0) => {
    console.log('HandRecorder: Recording action:', { playerId, action, amount, round: currentRound });

    try {
      const player = players.find(p => p.id === playerId);
      if (!player) {
        console.error('HandRecorder: Player not found:', playerId);
        return;
      }

      // Validate action
      if (action === 'raise' || action === 'bet') {
        if (amount <= 0) {
          toast({
            variant: "destructive",
            title: "Invalid Action",
            description: "Bet/raise amount must be greater than 0"
          });
          return;
        }
        if (amount > player.stack) {
          toast({
            variant: "destructive",
            title: "Invalid Action",
            description: "Cannot bet more than current stack"
          });
          return;
        }
      }

      // Record the action
      const newAction: Action = {
        playerId,
        playerName: player.name,
        action: action as any,
        amount,
        round: currentRound
      };

      setActions(prev => [...prev, newAction]);

      // Update player state
      setPlayers(prev => prev.map(p => {
        if (p.id === playerId) {
          let newStack = p.stack;
          let newCurrentBet = p.currentBet;
          let newTotalInvested = p.totalInvested;
          let folded = p.folded;
          let allIn = p.allIn;

          switch (action) {
            case 'fold':
              folded = true;
              break;
            case 'call':
              const callAmount = Math.min(amount, p.stack);
              newStack -= callAmount;
              newCurrentBet += callAmount;
              newTotalInvested += callAmount;
              if (newStack === 0) allIn = true;
              break;
            case 'raise':
            case 'bet':
              newStack -= amount;
              newCurrentBet += amount;
              newTotalInvested += amount;
              if (newStack === 0) allIn = true;
              break;
            case 'all-in':
              const allInAmount = p.stack;
              newStack = 0;
              newCurrentBet += allInAmount;
              newTotalInvested += allInAmount;
              allIn = true;
              break;
          }

          return {
            ...p,
            stack: newStack,
            currentBet: newCurrentBet,
            totalInvested: newTotalInvested,
            folded,
            allIn
          };
        }
        return p;
      }));

      // Update pot size
      if (action !== 'fold' && action !== 'check') {
        setPotSize(prev => prev + (action === 'all-in' ? player.stack : amount));
      }

      // Move to next player
      moveToNextPlayer();

    } catch (error) {
      console.error('HandRecorder: Error handling player action:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to record player action"
      });
    }
  };

  const moveToNextPlayer = () => {
    const activePlayers = players.filter(p => !p.folded && !p.allIn);
    if (activePlayers.length <= 1) {
      // Round is complete, move to next round or end hand
      proceedToNextRound();
      return;
    }

    setCurrentPlayerIndex(prev => {
      let nextIndex = (prev + 1) % players.length;
      while (players[nextIndex]?.folded || players[nextIndex]?.allIn) {
        nextIndex = (nextIndex + 1) % players.length;
        if (nextIndex === prev) break; // Prevent infinite loop
      }
      return nextIndex;
    });
  };

  const proceedToNextRound = () => {
    console.log('HandRecorder: Proceeding to next round from:', currentRound);

    // Reset current bets for next round
    setPlayers(prev => prev.map(p => ({ ...p, currentBet: 0 })));

    switch (currentRound) {
      case 'preflop':
        setCurrentRound('flop');
        setCommunityCards(prev => [...prev, '', '', '']); // Add 3 flop cards
        break;
      case 'flop':
        setCurrentRound('turn');
        setCommunityCards(prev => [...prev, '']); // Add turn card
        break;
      case 'turn':
        setCurrentRound('river');
        setCommunityCards(prev => [...prev, '']); // Add river card
        break;
      case 'river':
        // Hand is complete
        setShowdown(true);
        break;
    }

    // Reset to first active player for new round
    const firstActiveIndex = players.findIndex(p => !p.folded && !p.allIn);
    setCurrentPlayerIndex(firstActiveIndex >= 0 ? firstActiveIndex : 0);
  };

  const handleCommunityCardChange = (index: number, value: string) => {
    console.log('HandRecorder: Updating community card:', { index, value });
    setCommunityCards(prev => {
      const newCards = [...prev];
      newCards[index] = value;
      return newCards;
    });
  };

  const handleHoleCardChange = (index: number, value: string) => {
    console.log('HandRecorder: Updating hole card:', { index, value });
    setHoleCards(prev => {
      const newCards = [...prev];
      newCards[index] = value;
      return newCards;
    });
  };

  const startHand = () => {
    console.log('HandRecorder: Starting new hand');
    setHandStarted(true);
    setCurrentPlayerIndex(0); // Start with UTG preflop
  };

  const resetHand = () => {
    console.log('HandRecorder: Resetting hand');
    setCurrentRound('preflop');
    setActions([]);
    setPotSize(3);
    setCommunityCards([]);
    setHoleCards(['', '']);
    setCurrentPlayerIndex(0);
    setHandResult('loss');
    setAmountWon(0);
    setShowdown(false);
    setHandStarted(false);

    // Reset players to initial state
    setPlayers(prev => prev.map(p => ({
      ...p,
      stack: 200,
      currentBet: p.position === 'SB' ? 1 : p.position === 'BB' ? 2 : 0,
      totalInvested: p.position === 'SB' ? 1 : p.position === 'BB' ? 2 : 0,
      folded: false,
      allIn: false
    })));
  };

  const submitHand = async () => {
    console.log('HandRecorder: Submitting hand');

    if (!sessionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No session selected"
      });
      return;
    }

    if (holeCards.some(card => !card.trim())) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your hole cards"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const handData: HandData = {
        sessionId,
        position: heroPosition,
        holeCards: holeCards.filter(card => card.trim()),
        communityCards: communityCards.filter(card => card.trim()),
        actions,
        potSize,
        result: handResult,
        amountWon,
        showdown
      };

      console.log('HandRecorder: Submitting hand data:', handData);

      await createHand(handData);

      toast({
        title: "Success",
        description: "Hand recorded successfully"
      });

      resetHand();
      onHandRecorded();

    } catch (error) {
      console.error('HandRecorder: Error submitting hand:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record hand"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hand Recorder</CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant={currentRound === 'preflop' ? 'default' : 'secondary'}>
              Preflop
            </Badge>
            <Badge variant={currentRound === 'flop' ? 'default' : 'secondary'}>
              Flop
            </Badge>
            <Badge variant={currentRound === 'turn' ? 'default' : 'secondary'}>
              Turn
            </Badge>
            <Badge variant={currentRound === 'river' ? 'default' : 'secondary'}>
              River
            </Badge>
            <div className="ml-auto">
              <Badge variant="outline">Pot: ${potSize}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hero Cards */}
          <div className="space-y-2">
            <Label>Your Hole Cards</Label>
            <div className="flex gap-2">
              {holeCards.map((card, index) => (
                <Input
                  key={index}
                  value={card}
                  onChange={(e) => handleHoleCardChange(index, e.target.value)}
                  placeholder={`Card ${index + 1}`}
                  className="w-20"
                />
              ))}
            </div>
          </div>

          {/* Community Cards */}
          {currentRound !== 'preflop' && (
            <div className="space-y-2">
              <Label>Community Cards</Label>
              <div className="flex gap-2">
                {communityCards.map((card, index) => (
                  <Input
                    key={index}
                    value={card}
                    onChange={(e) => handleCommunityCardChange(index, e.target.value)}
                    placeholder={`Card ${index + 1}`}
                    className="w-20"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Players */}
          <div className="space-y-4">
            <Label>Players</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {players.map((player, index) => (
                <Card key={player.id} className={`${currentPlayerIndex === index && handStarted && !showdown ? 'ring-2 ring-blue-500' : ''} ${player.folded ? 'opacity-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.position}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${player.stack}</div>
                        {player.currentBet > 0 && (
                          <div className="text-sm text-blue-600">Bet: ${player.currentBet}</div>
                        )}
                      </div>
                    </div>
                    
                    {player.folded && <Badge variant="destructive">Folded</Badge>}
                    {player.allIn && <Badge variant="secondary">All-in</Badge>}
                    
                    {currentPlayerIndex === index && handStarted && !showdown && !player.folded && !player.allIn && (
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlayerAction(player.id, 'fold')}
                          >
                            Fold
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlayerAction(player.id, 'check')}
                          >
                            Check
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlayerAction(player.id, 'call', 10)}
                          >
                            Call
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlayerAction(player.id, 'all-in')}
                          >
                            All-in
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Bet amount"
                            className="flex-1"
                            id={`bet-${player.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(`bet-${player.id}`) as HTMLInputElement;
                              const amount = parseFloat(input?.value || '0');
                              if (amount > 0) {
                                handlePlayerAction(player.id, 'raise', amount);
                                input.value = '';
                              }
                            }}
                          >
                            Bet/Raise
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions History */}
          {actions.length > 0 && (
            <div className="space-y-2">
              <Label>Action History</Label>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {actions.map((action, index) => (
                  <div key={index} className="text-sm p-2 bg-muted rounded">
                    <Badge variant="outline" className="mr-2">{action.round}</Badge>
                    {action.playerName} {action.action}
                    {action.amount > 0 && ` $${action.amount}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hand Result (shown after showdown) */}
          {showdown && (
            <div className="space-y-4">
              <Separator />
              <div className="space-y-4">
                <Label>Hand Result</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="result">Result</Label>
                    <Select value={handResult} onValueChange={(value: 'win' | 'loss' | 'split') => setHandResult(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="win">Win</SelectItem>
                        <SelectItem value="loss">Loss</SelectItem>
                        <SelectItem value="split">Split</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amountWon">Amount Won</Label>
                    <Input
                      id="amountWon"
                      type="number"
                      value={amountWon}
                      onChange={(e) => setAmountWon(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={submitHand} disabled={isSubmitting} className="w-full">
                      {isSubmitting ? 'Recording...' : 'Record Hand'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!handStarted ? (
              <Button onClick={startHand}>Start Hand</Button>
            ) : (
              <>
                <Button variant="outline" onClick={resetHand}>
                  Reset Hand
                </Button>
                {currentRound !== 'river' && !showdown && (
                  <Button variant="outline" onClick={proceedToNextRound}>
                    Skip to {currentRound === 'preflop' ? 'Flop' : currentRound === 'flop' ? 'Turn' : 'River'}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};