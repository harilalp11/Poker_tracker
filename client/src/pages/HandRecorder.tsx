import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'
import { getSessionById, createHand } from '@/api/sessions'
import { CardSelector } from '@/components/hand-recorder/CardSelector'
import { PlayerCards } from '@/components/PlayerCards'
import { PlayingCard } from '@/components/PlayingCard'
import { ArrowLeft, Save, Play, RotateCcw } from 'lucide-react'



type GameStage = 'setup' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown-hands' | 'complete'
type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in'

interface Player {
  position: string
  name: string
  stack: number
  currentBet: number
  totalInvested: number
  isActive: boolean
  hasActed: boolean
  isFolded: boolean
  isAllIn: boolean
  holeCards?: string[]
  actions: Array<{
    round: string
    action: ActionType
    amount: number
    timestamp: Date
    position: string
  }>
}

interface GameState {
  handId: string
  gameStage: GameStage
  pot: { main: number; side: number[] }
  communityCards: string[]
  players: Player[]
  currentAction: { position: string; playerIndex: number }
  currentBet: number
  dealerPosition: number
  smallBlind: number
  bigBlind: number
}

export function HandRecorder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCardSelector, setShowCardSelector] = useState(false)
  const [cardSelectorType, setCardSelectorType] = useState<'hole' | 'flop' | 'turn' | 'river' | 'opponent'>('hole')
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState('')
  const [heroPosition, setHeroPosition] = useState('BB')
  const [holeCards, setHoleCards] = useState<string[]>([])
  const [tableSize, setTableSize] = useState('6-max')
  const [smallBlind, setSmallBlind] = useState(1)
  const [bigBlind, setBigBlind] = useState(2)

  const [gameState, setGameState] = useState<GameState>({
    handId: 'hand_' + Date.now(),
    gameStage: 'setup',
    pot: { main: 0, side: [] },
    communityCards: [],
    players: [],
    currentAction: { position: 'UTG', playerIndex: 0 },
    currentBet: 0,
    dealerPosition: 6,
    smallBlind: 1,
    bigBlind: 2
  })


  useEffect(() => {
    const fetchSession = async () => {
      if (!id) return
      try {
        const data = await getSessionById(id)
        setSession(data.session)
        const stakes = data.session.stakes
        if (stakes.includes('/')) {
          const [sb, bb] = stakes.split('/').map(s => parseFloat(s.replace('$', '')))
          if (!isNaN(sb)) setSmallBlind(sb)
          if (!isNaN(bb)) setBigBlind(bb)
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load session", variant: "destructive" })
        navigate('/sessions')
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [id, navigate, toast])

  const safeParseFloat = (value: string, fallback: number = 0): number => {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? fallback : parsed
  }

  const initializePlayers = () => {
    const positions = tableSize === '6-max' ?
      ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'] :
      ['UTG', 'UTG+1', 'MP1', 'MP2', 'HJ', 'CO', 'BTN', 'SB', 'BB']

    const players: Player[] = positions.map((position, index) => ({
      position,
      name: position === heroPosition ? 'Hero' : 'Player ' + (index + 1),
      stack: 200 * bigBlind,
      currentBet: 0,
      totalInvested: 0,
      isActive: true,
      hasActed: false,
      isFolded: false,
      isAllIn: false,
      holeCards: position === heroPosition ? holeCards : [],
      actions: []
    }))

    const sbIndex = positions.indexOf('SB')
    const bbIndex = positions.indexOf('BB')

    if (sbIndex !== -1) {
      players[sbIndex].currentBet = smallBlind
      players[sbIndex].totalInvested = smallBlind
      players[sbIndex].stack -= smallBlind
    }

    if (bbIndex !== -1) {
      players[bbIndex].currentBet = bigBlind
      players[bbIndex].totalInvested = bigBlind
      players[bbIndex].stack -= bigBlind
    }

    return players
  }

  const startHand = () => {
    if (!holeCards || holeCards.length !== 2) {
      toast({ title: "Error", description: "Please select your hole cards first", variant: "destructive" })
      return
    }

    const players = initializePlayers()
    const utgIndex = players.findIndex(p => p.position === 'UTG')

    setGameState({
      ...gameState,
      gameStage: 'preflop',
      players,
      pot: { main: smallBlind + bigBlind, side: [] },
      currentBet: bigBlind,
      currentAction: { position: 'UTG', playerIndex: utgIndex },
      smallBlind,
      bigBlind
    })
  }

  const getValidActions = (player: Player): ActionType[] => {
    const actions: ActionType[] = ['fold']
    const callAmount = gameState.currentBet - player.currentBet

    if (callAmount === 0) {
      actions.push('check')
      if (player.stack > 0) {
        actions.push('bet')
      }
    } else {
      if (player.stack >= callAmount) {
        actions.push('call')
      }
      if (player.stack > callAmount) {
        actions.push('raise')
      }
    }

    if (player.stack > 0) {
      actions.push('all-in')
    }

    return actions
  }

  const executeAction = (action: ActionType, amount: number = 0) => {
    const newGameState = { ...gameState }
    const currentPlayer = newGameState.players[newGameState.currentAction.playerIndex]

    const actionRecord = {
      round: newGameState.gameStage,
      action,
      amount,
      timestamp: new Date(),
      position: currentPlayer.position
    }
    currentPlayer.actions.push(actionRecord)

    switch (action) {
      case 'fold':
        currentPlayer.isFolded = true
        currentPlayer.isActive = false
        break
      case 'check':
        break
      case 'call':
        const callAmount = newGameState.currentBet - currentPlayer.currentBet
        currentPlayer.stack -= callAmount
        currentPlayer.currentBet = newGameState.currentBet
        currentPlayer.totalInvested += callAmount
        newGameState.pot.main += callAmount
        break
      case 'bet':
      case 'raise':
        const betAmount = amount
        currentPlayer.stack -= betAmount
        currentPlayer.currentBet += betAmount
        currentPlayer.totalInvested += betAmount
        newGameState.pot.main += betAmount
        if (currentPlayer.currentBet > newGameState.currentBet) {
          newGameState.currentBet = currentPlayer.currentBet
          newGameState.players.forEach((p, idx) => {
            if (idx !== newGameState.currentAction.playerIndex && p.isActive && !p.isFolded) {
              p.hasActed = false
            }
          })
        }
        break
      case 'all-in':
        const allInAmount = currentPlayer.stack
        currentPlayer.stack = 0
        currentPlayer.currentBet += allInAmount
        currentPlayer.totalInvested += allInAmount
        currentPlayer.isAllIn = true
        newGameState.pot.main += allInAmount
        if (currentPlayer.currentBet > newGameState.currentBet) {
          newGameState.currentBet = currentPlayer.currentBet
          newGameState.players.forEach((p, idx) => {
            if (idx !== newGameState.currentAction.playerIndex && p.isActive && !p.isFolded) {
              p.hasActed = false
            }
          })
        }
        break
    }

    currentPlayer.hasActed = true

    const nextPlayerIndex = getNextPlayer(newGameState)
    if (nextPlayerIndex === -1 || isRoundComplete(newGameState)) {
      advanceToNextRound(newGameState)
    } else {
      newGameState.currentAction = {
        position: newGameState.players[nextPlayerIndex].position,
        playerIndex: nextPlayerIndex
      }
    }

    setGameState(newGameState)
    setBetAmount('')
  }

  const getNextPlayer = (state: GameState): number => {
    const currentIndex = state.currentAction.playerIndex
    for (let i = 1; i < state.players.length; i++) {
      const nextIndex = (currentIndex + i) % state.players.length
      const player = state.players[nextIndex]
      if (player.isActive && !player.isFolded && !player.isAllIn && !player.hasActed) {
        return nextIndex
      }
    }
    return -1
  }

  const isRoundComplete = (state: GameState): boolean => {
    const activePlayers = state.players.filter(p => p.isActive && !p.isFolded)
    if (activePlayers.length <= 1) return true
    return activePlayers.every(player =>
      player.hasActed &&
      (player.currentBet === state.currentBet || player.isAllIn)
    )
  }

  const advanceToNextRound = (state: GameState) => {
    state.players.forEach(player => {
      player.hasActed = false
      player.currentBet = 0
    })
    state.currentBet = 0

    const activePlayers = state.players.filter(p => p.isActive && !p.isFolded && !p.isAllIn)
    if (activePlayers.length <= 1) {
      state.gameStage = 'complete'
      return
    }

    switch (state.gameStage) {
      case 'preflop':
        state.gameStage = 'flop'
        openCardSelector('flop')
        break
      case 'flop':
        state.gameStage = 'turn'
        openCardSelector('turn')
        break
      case 'turn':
        state.gameStage = 'river'
        openCardSelector('river')
        break
      case 'river':
        state.gameStage = 'showdown-hands'
        break
    }

    if (state.gameStage !== 'complete' && state.gameStage !== 'showdown-hands') {
      const dealerIndex = state.players.findIndex(p => p.position === 'BTN')
      for (let i = 1; i < state.players.length; i++) {
        const nextIndex = (dealerIndex + i) % state.players.length
        const player = state.players[nextIndex]
        if (player.isActive && !player.isFolded && !player.isAllIn) {
          state.currentAction = {
            position: player.position,
            playerIndex: nextIndex
          }
          break
        }
      }
    }
  }

  const openCardSelector = (type: 'hole' | 'flop' | 'turn' | 'river' | 'opponent', playerIndex?: number) => {
    setCardSelectorType(type)
    if (type === 'opponent' && typeof playerIndex === 'number') {
      setSelectedPlayerIndex(playerIndex)
    }
    setShowCardSelector(true)
  }

  const handleCardsSelected = (cards: string[]) => {
    switch (cardSelectorType) {
      case 'hole':
        setHoleCards(cards)
        break
      case 'flop':
        if (cards.length === 3) {
          setGameState(prev => ({
            ...prev,
            communityCards: cards
          }))
        }
        break
      case 'turn':
        if (cards.length === 1) {
          setGameState(prev => ({
            ...prev,
            communityCards: [...prev.communityCards, ...cards]
          }))
        }
        break
      case 'river':
        if (cards.length === 1) {
          setGameState(prev => ({
            ...prev,
            communityCards: [...prev.communityCards, ...cards]
          }))
        }
        break
      case 'opponent':
        if (selectedPlayerIndex !== null && cards.length === 2) {
          setGameState(prev => {
            const players = [...prev.players]
            players[selectedPlayerIndex].holeCards = cards
            return { ...prev, players }
          })
        }
        break
    }
    setShowCardSelector(false)
    setSelectedPlayerIndex(null)
  }

  const handleFinalSave = async () => {
    try {
      const handData = {
        position: heroPosition,
        holeCards: holeCards,
        communityCards: {
          flop: gameState.communityCards.slice(0, 3),
          turn: gameState.communityCards[3] || null,
          river: gameState.communityCards[4] || null
        },
        actions: gameState.players.flatMap(p => p.actions),
        result: 0,
        tags: [],
        notes: '',
        importance: 1
      }

      await createHand(id, handData)
      toast({ title: "Success", description: "Hand saved successfully!" })
      navigate('/sessions/' + id)
    } catch (error) {
      console.error('Error saving hand:', error)
      toast({ title: "Error", description: "Failed to save hand", variant: "destructive" })
    }
  }

  const resetHand = () => {
    setGameState({
      handId: 'hand_' + Date.now(),
      gameStage: 'setup',
      pot: { main: 0, side: [] },
      communityCards: [],
      players: [],
      currentAction: { position: 'UTG', playerIndex: 0 },
      currentBet: 0,
      dealerPosition: 6,
      smallBlind: 1,
      bigBlind: 2
    })
    setHoleCards([])
    setBetAmount('')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Session not found</p>
      </div>
    )
  }

  const currentPlayer = gameState.players[gameState.currentAction.playerIndex]
  const validActions = currentPlayer ? getValidActions(currentPlayer) : []
  const allOpponentsHaveCards = gameState.players
    .filter(p => p.position !== heroPosition)
    .every(p => p.holeCards && p.holeCards.length === 2)

  const getMaxCards = () => {
    switch (cardSelectorType) {
      case 'hole': return 2
      case 'flop': return 3
      case 'turn':
      case 'river': return 1
      case 'opponent': return 2
      default: return 2
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/sessions/' + id)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Session
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Hand Recorder</h1>
            <p className="text-slate-600 dark:text-slate-400">{session.venue} • {session.stakes} • {session.gameType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={
            gameState.gameStage === 'setup' ? 'bg-gray-100' :
            gameState.gameStage === 'preflop' ? 'bg-purple-100 text-purple-800' :
            gameState.gameStage === 'flop' ? 'bg-blue-100 text-blue-800' :
            gameState.gameStage === 'turn' ? 'bg-green-100 text-green-800' :
            gameState.gameStage === 'river' ? 'bg-orange-100 text-orange-800' :
            'bg-yellow-100 text-yellow-800'
          }>
            {gameState.gameStage.toUpperCase()}
          </Badge>
          {gameState.pot.main > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Pot: ${gameState.pot.main}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={resetHand}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {gameState.gameStage === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Game Setup</CardTitle>
              <CardDescription>Configure the hand parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smallBlind">Small Blind ($)</Label>
                  <Input id="smallBlind" type="number" step="0.01" value={smallBlind.toString()} onChange={(e) => setSmallBlind(safeParseFloat(e.target.value, 1))} />
                </div>
                <div>
                  <Label htmlFor="bigBlind">Big Blind ($)</Label>
                  <Input id="bigBlind" type="number" step="0.01" value={bigBlind.toString()} onChange={(e) => setBigBlind(safeParseFloat(e.target.value, 2))} />
                </div>
              </div>

              <div>
                <Label>Hero Position</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'].map((pos) => (
                    <Button key={pos} type="button" variant={heroPosition === pos ? "default" : "outline"} onClick={() => setHeroPosition(pos)} className={heroPosition === pos ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                      {pos}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Your Hole Cards</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border rounded-lg bg-white">
                    {holeCards.length === 0 ? (
                      <span className="text-slate-500 text-sm">No cards selected</span>
                    ) : (
                      holeCards.map((card, index) => (
                        <Badge key={index} variant="default" className="px-3 py-1 text-base bg-green-600">
                          {card}
                        </Badge>
                      ))
                    )}
                  </div>
                  <Button type="button" variant="outline" onClick={() => openCardSelector('hole')} className="w-full">
                    {holeCards.length === 0 ? 'Select Your Cards' : 'Change Cards'}
                  </Button>
                </div>
              </div>

              <Button onClick={startHand} disabled={holeCards.length !== 2} size="lg" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3">
                <Play className="h-5 w-5 mr-2" />
                START HAND
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState.gameStage !== 'setup' && gameState.gameStage !== 'complete' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Poker Table</CardTitle>
              <CardDescription>
                {gameState.gameStage === 'showdown-hands'
                  ? "Select opponents' hole cards"
                  : `Current Action: ${currentPlayer?.name} (${currentPlayer?.position})`}
              </CardDescription>
            </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <PlayerCards cards={gameState.communityCards} size="medium" />
              <div className="flex flex-wrap justify-center gap-4 w-full">
                {gameState.players.map((player, index) => {
                  const isCurrentPlayer = index === gameState.currentAction.playerIndex
                  return (
                    <div
                      key={player.position}
                      className={`p-2 rounded border text-center w-24 ${
                        player.isFolded ? 'opacity-50' : ''
                      } ${isCurrentPlayer ? 'border-blue-500' : 'border-slate-200'}`}
                    >
                      <div className="text-xs font-bold">{player.position}</div>
                      <div className="text-xs">Stack: ${player.stack}</div>
                      {player.currentBet > 0 && (
                        <div className="text-xs">Bet: ${player.currentBet}</div>
                      )}
                      {player.position === heroPosition && holeCards.length > 0 && (
                        <PlayerCards cards={holeCards} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
          </Card>

          {currentPlayer && gameState.gameStage !== 'showdown-hands' && gameState.gameStage !== 'complete' && (
            <Card>
              <CardHeader>
                <CardTitle>Player Action: {currentPlayer.name} ({currentPlayer.position})</CardTitle>
                <CardDescription>Stack: ${currentPlayer.stack} | To Call: ${gameState.currentBet - currentPlayer.currentBet}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {validActions.map((action) => (
                      <Button key={action} variant="outline" onClick={() => {
                        if (action === 'bet' || action === 'raise') {
                          const amount = safeParseFloat(betAmount, 0)
                          if (amount > 0) {
                            executeAction(action, amount)
                          }
                        } else if (action === 'call') {
                          executeAction(action, gameState.currentBet - currentPlayer.currentBet)
                        } else {
                          executeAction(action)
                        }
                      }} className={'h-12 ' + (action === 'fold' ? 'hover:bg-red-50 hover:border-red-300' : action === 'call' ? 'hover:bg-green-50 hover:border-green-300' : action === 'raise' || action === 'bet' ? 'hover:bg-blue-50 hover:border-blue-300' : 'hover:bg-gray-50')}>
                        {action.toUpperCase()}
                        {action === 'call' && ' $' + (gameState.currentBet - currentPlayer.currentBet)}
                      </Button>
                    ))}
                  </div>

                  {(validActions.includes('bet') || validActions.includes('raise')) && (
                    <div className="flex gap-2">
                      <Input type="number" placeholder="Bet amount" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="flex-1" />
                      <Button onClick={() => setBetAmount(String(gameState.pot.main))} variant="outline" size="sm">Pot</Button>
                      <Button onClick={() => setBetAmount(String(currentPlayer.stack))} variant="outline" size="sm">All-In</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {gameState.gameStage === 'showdown-hands' && (
            <Card>
              <CardHeader>
                <CardTitle>Showdown Hands</CardTitle>
                <CardDescription>Record opponents' hole cards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gameState.players.map((player, index) => (
                    player.position !== heroPosition && (
                      <div key={player.position} className="flex items-center justify-between">
                        <div className="font-medium">{player.name} ({player.position})</div>
                        <div className="flex gap-2">
                          {[0,1].map(i => (
                              player.holeCards && player.holeCards[i] ? (
                                <div key={i} onClick={() => openCardSelector('opponent', index)} className="cursor-pointer">
                                  <PlayingCard card={player.holeCards[i]} />
                                </div>
                              ) : (
                              <div key={i} onClick={() => openCardSelector('opponent', index)} className="w-12 h-20 border-2 border-dashed rounded flex items-center justify-center text-gray-400 cursor-pointer">+</div>
                            )
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  <Button onClick={() => setGameState(prev => ({ ...prev, gameStage: 'complete' }))} disabled={!allOpponentsHaveCards} className="w-full">Finish Recording</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Action History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {gameState.players.flatMap(p => p.actions).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((action, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <Badge variant="outline" className="mr-2">{action.round}</Badge>
                    {action.position}: {action.action}
                    {action.amount > 0 && ' $' + action.amount}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState.gameStage === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle>Hand Complete</CardTitle>
            <CardDescription>Record the final result</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold">Final Pot: ${gameState.pot.main}</p>
                <p className="text-sm text-gray-600">Community Cards: {gameState.communityCards.join(', ')}</p>
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={resetHand}>Record Another Hand</Button>
                <Button onClick={handleFinalSave} className="bg-green-600 hover:bg-green-700 text-white"></Button>
                  <Save className="h-4 w-4 mr-2" />Save Hand
                  
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showCardSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <CardSelector
            selectedCards={
              cardSelectorType === 'hole'
                ? holeCards
                : cardSelectorType === 'opponent' && selectedPlayerIndex !== null
                ? gameState.players[selectedPlayerIndex].holeCards || []
                : []
            }
            onCardsChange={handleCardsSelected}
            maxCards={getMaxCards()}
            onClose={() => {
              setShowCardSelector(false)
              setSelectedPlayerIndex(null)
            }}
          />
        </div>
      )}
    </div>
  )
}