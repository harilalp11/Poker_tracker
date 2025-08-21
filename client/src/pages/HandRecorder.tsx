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
import { ArrowLeft, Save, Play, RotateCcw } from 'lucide-react'
import { PlayingCard } from "./PlayingCard"
import playerAvatar from "./player_id.png";
import playerChips from "./chips.png";



type GameStage = 'setup' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'complete'
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
  const [cardSelectorType, setCardSelectorType] = useState<'hole' | 'flop' | 'turn' | 'river' | 'player'>('hole')
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null)
  const [betAmount, setBetAmount] = useState('')
  const [heroPosition, setHeroPosition] = useState('BB')
  const [holeCards, setHoleCards] = useState<string[]>([])
  const tableSize = '6-max'
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

  const [winners, setWinners] = useState<Array<{playerId: string, playerName: string, amount: number, hand: string}>>([])

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
      } catch {
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
      case 'call': {
        const callAmount = newGameState.currentBet - currentPlayer.currentBet
        currentPlayer.stack -= callAmount
        currentPlayer.currentBet = newGameState.currentBet
        currentPlayer.totalInvested += callAmount
        newGameState.pot.main += callAmount
        break
      }
      case 'bet':
      case 'raise': {
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
      }
      case 'all-in': {
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

  const getNextPlayerNeedingCards = (startIndex: number): number => {
    for (let i = startIndex + 1; i < gameState.players.length; i++) {
      const player = gameState.players[i]
      if (!player.holeCards || player.holeCards.length < 2) {
        return i
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
      case 'river': {
        state.gameStage = 'showdown'
        const firstIndex = state.players.findIndex(p => !p.holeCards || p.holeCards.length < 2)
        if (firstIndex !== -1) {
          setSelectedPlayerIndex(firstIndex)
          openCardSelector('player')
        } else {
          state.gameStage = 'complete'
        }
        break
      }
    }

    if (state.gameStage !== 'complete' && state.gameStage !== 'showdown') {
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

  const openCardSelector = (type: 'hole' | 'flop' | 'turn' | 'river' | 'player') => {
    setCardSelectorType(type)
    setShowCardSelector(true)
  }

  interface ParsedCard { rank: number; suit: string }

  const parseCard = (card: string): ParsedCard => {
    const suit = card.slice(-1)
    const rankStr = card.slice(0, -1)
    const rankMap: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    }
    return { rank: rankMap[rankStr], suit }
  }

  interface HandValue {
    category: number
    ranks: number[]
    name: string
  }

  const evaluate5CardHand = (cards: ParsedCard[]): HandValue => {
    const ranks = cards.map(c => c.rank).sort((a, b) => b - a)
    const suits = cards.map(c => c.suit)

    const rankCounts: Record<number, number> = {}
    ranks.forEach(r => { rankCounts[r] = (rankCounts[r] || 0) + 1 })
    const rankGroups = Object.entries(rankCounts)
      .map(([rank, count]) => ({ rank: Number(rank), count }))
      .sort((a, b) => b.count - a.count || b.rank - a.rank)

    const isFlush = suits.every(s => s === suits[0])

    const uniqueRanks = Array.from(new Set(ranks))
    let isStraight = false
    let straightHigh = uniqueRanks[0]
    if (uniqueRanks.length === 5) {
      if (uniqueRanks[0] - uniqueRanks[4] === 4) {
        isStraight = true
      } else if (JSON.stringify(uniqueRanks) === JSON.stringify([14, 5, 4, 3, 2])) {
        isStraight = true
        straightHigh = 5
      }
    }

    if (isStraight && isFlush) {
      return { category: 8, ranks: [straightHigh], name: 'Straight Flush' }
    }
    if (rankGroups[0].count === 4) {
      return { category: 7, ranks: [rankGroups[0].rank, rankGroups[1].rank], name: 'Four of a Kind' }
    }
    if (rankGroups[0].count === 3 && rankGroups[1].count === 2) {
      return { category: 6, ranks: [rankGroups[0].rank, rankGroups[1].rank], name: 'Full House' }
    }
    if (isFlush) {
      return { category: 5, ranks, name: 'Flush' }
    }
    if (isStraight) {
      return { category: 4, ranks: [straightHigh], name: 'Straight' }
    }
    if (rankGroups[0].count === 3) {
      const kickers = rankGroups.slice(1).map(g => g.rank)
      return { category: 3, ranks: [rankGroups[0].rank, ...kickers], name: 'Three of a Kind' }
    }
    if (rankGroups[0].count === 2 && rankGroups[1].count === 2) {
      const pairRanks = rankGroups.slice(0, 2).map(g => g.rank)
      const kicker = rankGroups[2].rank
      return { category: 2, ranks: [...pairRanks, kicker], name: 'Two Pair' }
    }
    if (rankGroups[0].count === 2) {
      const kickers = rankGroups.slice(1).map(g => g.rank)
      return { category: 1, ranks: [rankGroups[0].rank, ...kickers], name: 'One Pair' }
    }
    return { category: 0, ranks, name: 'High Card' }
  }

  const compareHandValues = (a: HandValue, b: HandValue): number => {
    if (a.category !== b.category) return a.category - b.category
    for (let i = 0; i < a.ranks.length; i++) {
      if ((a.ranks[i] || 0) !== (b.ranks[i] || 0)) {
        return (a.ranks[i] || 0) - (b.ranks[i] || 0)
      }
    }
    return 0
  }

  const getBestHandValue = (cards: ParsedCard[]): HandValue => {
    let best: HandValue | null = null
    const n = cards.length
    for (let i = 0; i < n - 4; i++)
      for (let j = i + 1; j < n - 3; j++)
        for (let k = j + 1; k < n - 2; k++)
          for (let l = k + 1; l < n - 1; l++)
            for (let m = l + 1; m < n; m++) {
              const combo = [cards[i], cards[j], cards[k], cards[l], cards[m]]
              const value = evaluate5CardHand(combo)
              if (!best || compareHandValues(value, best) > 0) {
                best = value
              }
            }
    return best as HandValue
  }

  const determineWinners = (state: GameState) => {
    const board = state.communityCards.map(parseCard)
    const activePlayers = state.players.filter(p => !p.isFolded && p.holeCards && p.holeCards.length === 2)
    const results = activePlayers.map(p => {
      const cards = [...p.holeCards!.map(parseCard), ...board]
      return { player: p, value: getBestHandValue(cards) }
    })

    let best = results[0]?.value
    if (!best) return
    let winnerResults = [results[0]]
    for (let i = 1; i < results.length; i++) {
      const cmp = compareHandValues(results[i].value, best)
      if (cmp > 0) {
        best = results[i].value
        winnerResults = [results[i]]
      } else if (cmp === 0) {
        winnerResults.push(results[i])
      }
    }

    const winAmount = state.pot.main / winnerResults.length
    setWinners(winnerResults.map(r => ({
      playerId: r.player.position,
      playerName: r.player.name,
      amount: parseFloat(winAmount.toFixed(2)),
      hand: r.value.name
    })))
  }

  useEffect(() => {
    if (gameState.gameStage === 'complete') {
      determineWinners(gameState)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.gameStage])

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
      case 'player': {
        if (selectedPlayerIndex !== null && cards.length === 2) {
          setGameState(prev => {
            const players = [...prev.players]
            players[selectedPlayerIndex].holeCards = cards
            return { ...prev, players }
          })
          const nextIndex = getNextPlayerNeedingCards(selectedPlayerIndex)
          if (nextIndex !== -1) {
            setSelectedPlayerIndex(nextIndex)
            setTimeout(() => openCardSelector('player'), 0)
          } else {
            setGameState(prev => ({ ...prev, gameStage: 'complete' }))
          }
        }
        break
      }
    }
    setShowCardSelector(false)
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
    setWinners([])
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

  const getMaxCards = () => {
    switch (cardSelectorType) {
      case 'hole': return 2
      case 'flop': return 3
      case 'turn':
      case 'river': return 1
      case 'player': return 2
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
              <CardDescription>Current Action: {currentPlayer?.name} ({currentPlayer?.position})</CardDescription>
            </CardHeader>
            <CardContent>
              <style jsx>{`
                // .poker-table {
                //   width: 600px;
                //   height: 360px;
                //   background: linear-gradient(135deg, #2D7D7D 0%, #1A6B6B 100%);
                //   border: 20px solid #8B4513;
                //   border-radius: 180px;
                //   box-shadow:
                //     inset 0 0 20px rgba(0,0,0,0.3),
                //     0 8px 16px rgba(0,0,0,0.4);
                //   position: relative;
                //   margin: 0 auto;
                //   max-width: 100%;
                // }

                // .poker-table::before {
                //   content: '';
                //   position: absolute;
                //   top: -20px;
                //   left: -20px;
                //   right: -20px;
                //   bottom: -20px;
                //   background: linear-gradient(135deg, #A0522D 0%, #8B4513 50%, #654321 100%);
                //   border-radius: 180px;
                //   z-index: -1;
                //   box-shadow: 0 12px 24px rgba(0,0,0,0.5);
                // }

                // .poker-table::after {
                //   content: '';
                //   position: absolute;
                //   top: 10px;
                //   left: 10px;
                //   right: 10px;
                //   bottom: 10px;
                //   border: 1px solid rgba(255,255,255,0.1);
                //   border-radius: 170px;
                //   pointer-events: none;
                // }

                .felt-texture {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background-image: 
                    radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0),
                    radial-gradient(circle at 1px 3px, rgba(0,0,0,0.1) 0.5px, transparent 0);
                  background-size: 12px 12px, 8px 8px;
                  border-radius: 160px;
                  opacity: 0.3;
                  pointer-events: none;
                }

                .wood-grain {
                  position: absolute;
                  top: -20px;
                  left: -20px;
                  right: -20px;
                  bottom: -20px;
                  background-image:
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 2px,
                      rgba(0,0,0,0.1) 2px,
                      rgba(0,0,0,0.1) 4px
                    ),
                    repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 1px,
                      rgba(0,0,0,0.05) 1px,
                      rgba(0,0,0,0.05) 2px
                    );
                  border-radius: 180px;
                  opacity: 0.4;
                  pointer-events: none;
                  z-index: 1;
                }

                .community-cards-center {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 200px;
                  height: 80px;
                  background: linear-gradient(135deg, #1A6B6B 0%, #2D7D7D 100%);
                  border: 2px solid #8B4513;
                  border-radius: 12px;
                  box-shadow:
                    0 6px 12px rgba(0,0,0,0.3),
                    inset 0 2px 4px rgba(0,0,0,0.2);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 10;
                }

                .player-position {
                  position: absolute;
                  transform: translate(-50%, -50%);
                  z-index: 20;
                  transition: all 0.3s ease;
                }

                .player-position:hover {
                  transform: translate(-50%, -50%) scale(1.05);
                }

                .player-card {
                  background: rgba(0, 212, 236, 0.43);
                  border: 2px solid #00bfffff;
                  border-radius: 8px;
                  padding: 8px 12px;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                  min-width: 80px;
                  text-align: center;
                }

                .player-card.current-player {
                  border-color: #3b82f6;
                  box-shadow: 
                    0 4px 8px rgba(0,0,0,0.2),
                    0 0 0 3px rgba(59, 130, 246, 0.3);
                  animation: pulse-glow 2s ease-in-out infinite;
                }

                .player-card.folded {
                  opacity: 0.5;
                  border-color: #ef4444;
                  background: rgba(239, 68, 68, 0.1);
                }

                @keyframes pulse-glow {
                  0%, 100% {
                    box-shadow: 
                      0 4px 8px rgba(0,0,0,0.2),
                      0 0 0 3px rgba(59, 130, 246, 0.3);
                  }
                  50% {
                    box-shadow: 
                      0 4px 8px rgba(0,0,0,0.2),
                      0 0 0 3px rgba(59, 130, 246, 0.6);
                  }
                }

                @media (max-width: 768px) {
                  .poker-table {
                    width: 480px;
                    height: 288px;
                  }
                  
                  .community-cards-center {
                    width: 160px;
                    height: 64px;
                  }
                }

                @media (max-width: 640px) {
                  .poker-table {
                    width: 360px;
                    height: 216px;
                    border-width: 15px;
                  }
                  
                  .poker-table::before {
                    top: -15px;
                    left: -15px;
                    right: -15px;
                    bottom: -15px;
                  }
                  
                  .community-cards-center {
                    width: 120px;
                    height: 48px;
                  }
                  
                  .player-card {
                    padding: 6px 8px;
                    min-width: 60px;
                  }
                }
              `}</style>

              <div className="relative w-full overflow-x-auto flex justify-center">
                <div className="poker-table">
                  <img src="/new_table.png" alt="img" />


                  {/* Wood grain texture */}
                  {/* <div className="wood-grain"></div>
                   */}
                  {/* Felt texture */}
                  {/* <div className="felt-texture"></div> */}

                  {/* Center area for community cards */}
                  <div className="community-cards-center">
                    <div className="text-amber-200 text-xs font-bold text-center leading-tight">
                      COMMUNITY CARDS<br />
                      <span className="text-amber-300 text-sm">♠ ♥ ♦ ♣</span>
                    </div>
                  </div>

                                    {/* Community cards display (flop/turn/rive r) */}
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1 z-15">
                    {[0,1,2,3,4].map((i) => {
                      const c = gameState.communityCards[i];
                      return c ? (
                        // Smaller size + disable hover scaling for board cards
                  <PlayingCard key={i} code={c} className="w-10 h-16 hover:scale-100" />
                      ) : (
                        // Empty slot placeholder until that street is dealt
                  <div
                          key={i}
                          className="w-12 h-18 rounded-md border border-dashed border-gray-400 bg-gray-100
                                    flex items-center justify-center text-xs text-gray-500"
                  >
                          ?
                  </div>
                      );
                    })}
                  </div>

                  {/* Pot display */}
                  <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 
                  flex items-center justify-center border-4 border-amber-700 shadow-xl">
    
    {/* Glow effect */}
    <div className="absolute inset-0 rounded-full bg-amber-400 opacity-30 blur-xl animate-pulse"></div>

    {/* Inner chip ring */}
    <div className="absolute inset-1 rounded-full border-2 border-amber-200"></div>

    {/* Pot text */}
    <div className="relative text-center">
      <div className="text-[10px] font-extrabold text-amber-900 tracking-wider drop-shadow-md">
        POT
      </div>
      <div className="text-sm font-black text-amber-900 drop-shadow-md">
        ${gameState.pot.main}
      </div>
    </div>
  </div>
</div>


                  {/* Player positions around oval table */}
                  {gameState.players.map((player, index) => {
                    const isCurrentPlayer = index === gameState.currentAction.playerIndex
                    
                    // Calculate positions around oval table
                    const totalPlayers = gameState.players.length
                    const angleStep = (2 * Math.PI) / totalPlayers
                    const angle = index * angleStep - Math.PI / 2 // Start from top

                    // Oval positioning with different radii for x and y
                    const radiusX = 260 // Horizontal radius
                    const radiusY = 140 // Vertical radius

                    const x = 50 + (radiusX * Math.cos(angle)) / 6 // Convert to percentage and scale
                    const y = 50 + (radiusY * Math.sin(angle)) / 3.6 // Convert to percentage and scale

                    return (
                      <div 
                        key={player.position} 
                        className="player-position"
                        style={{ 
                          left: `${x}%`, 
                          top: `${y}%`
                        }}
                      >
                        {/* //div for imge  */}
                        <div className="player-img flex justify-center">
                          <img
                            src={playerAvatar}
                            alt="Player avatar"
                            className="w-16 h-18"
                          />
                        </div>


                        {(() => {
                          const winner = winners.find(w => w.playerId === player.position)
                          return (
                            <div className={`player-card ${
                              player.isFolded ? 'folded' :
                              isCurrentPlayer ? 'current-player' : ''
                            } ${winner ? 'ring-2 ring-green-400' : ''}`}>
                              <div className="text-xs font-bold">{player.position}</div>


                          {/* chips */}
                      <div className="flex items-center gap-1 flex justify-center">
                        <div className="player_chips">
                          <img
                            src={playerChips}
                            alt="Player chip"
                            className="w-5 h-5"
                          />
                        </div>
                        <div className="text-xs">${player.stack}</div>
                      </div>


                      
                          
                          {player.currentBet > 0 && (
                            <div className="text-xs text-white-600">Bet: ${player.currentBet}</div>
                          )}
                          {(() => {
                            console.log('HandRecorder: Checking hole cards for player:', player.position);
                            console.log('HandRecorder: Hero position:', heroPosition);
                            console.log('HandRecorder: Hole cards:', holeCards);
                            console.log('HandRecorder: Should show cards:', player.position === heroPosition && holeCards.length > 0);
                            return null;
                          })()}
                              {player.holeCards && player.holeCards.length === 2 && (
                                <div className="flex gap-1 mt-1 justify-center">
                                  {player.holeCards.map((card, index) => (
                                    <PlayingCard key={index} code={card} />
                                  ))}
                                </div>
                              )}
                              {winner && (
                                <div className="text-xs text-green-600 font-bold mt-1">
                                  Won ${winner.amount}
                                </div>
                              )}
                            </div>
                          )
                        })()}

                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {currentPlayer && gameState.gameStage !== 'showdown' && gameState.gameStage !== 'complete' && (
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
              <div className="space-y-1">
                {gameState.players.map(player => {
                  const winner = winners.find(w => w.playerId === player.position)
                  return (
                    <div key={player.position} className="text-sm space-y-0.5">
                      <div className="flex justify-between">
                        <span>{player.name} ({player.position}) - {player.holeCards?.join(' ') || '—'}</span>
                        {winner ? (
                          <span className="text-green-600 font-semibold">Won ${winner.amount} ({winner.hand})</span>
                        ) : (
                          <span className="text-slate-500">Lost</span>
                        )}
                      </div>
                      <div className="ml-4 text-xs text-gray-500">
                        {(['preflop', 'flop', 'turn', 'river'] as GameStage[]).map(round => {
                          const actions = player.actions.filter(a => a.round === round)
                          if (actions.length === 0) return null
                          return (
                            <div key={round}>
                              {round.charAt(0).toUpperCase() + round.slice(1)}: {actions.map(a => `${a.action}${a.amount > 0 ? ' $' + a.amount : ''}`).join(', ')}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={resetHand}>Record Another Hand</Button>
                <Button onClick={handleFinalSave} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="h-4 w-4 mr-2" />Save Hand
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showCardSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          {cardSelectorType === 'player' && selectedPlayerIndex !== null && (
            <div className="absolute top-4 text-white text-xl font-bold">
              {gameState.players[selectedPlayerIndex].name} ({gameState.players[selectedPlayerIndex].position})
            </div>
          )}
          <CardSelector
            selectedCards={
              cardSelectorType === 'hole'
                ? holeCards
                : cardSelectorType === 'player' && selectedPlayerIndex !== null
                  ? gameState.players[selectedPlayerIndex].holeCards || []
                  : []
            }
            onCardsChange={handleCardsSelected}
            maxCards={getMaxCards()}
            onClose={() => setShowCardSelector(false)}
          />
        </div>
      )}
    </div>
  )
}