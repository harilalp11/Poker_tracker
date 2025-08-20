import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/useToast'
import { getHandsBySession, deleteHand } from '@/api/sessions'
import { Trash2, Edit, Star, Clock } from 'lucide-react'

interface HandsListProps {
  sessionId: string
  onHandsChange: () => void
}

export function HandsList({ sessionId, onHandsChange }: HandsListProps) {
  const [hands, setHands] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchHands = async () => {
    if (!sessionId) {
      console.log('HandsList: No sessionId provided')
      setLoading(false)
      return
    }

    try {
      console.log('HandsList: Fetching hands for session:', sessionId)
      const data = await getHandsBySession(sessionId)
      console.log('HandsList: Hands data received:', data)

      // Ensure hands is always an array
      const handsArray = Array.isArray(data?.hands) ? data.hands : []
      console.log('HandsList: Setting hands array:', handsArray.length, 'hands')
      
      // DEBUG: Log the structure of each hand to understand community cards storage
      handsArray.forEach((hand, index) => {
        console.log(`HandsList: Hand ${index + 1} structure:`, {
          _id: hand._id,
          communityCards: hand.communityCards,
          communityCardsType: typeof hand.communityCards,
          communityCardsIsArray: Array.isArray(hand.communityCards),
          communityCardsLength: hand.communityCards?.length,
          holeCards: hand.holeCards,
          fullHandData: JSON.stringify(hand, null, 2)
        })
      })
      
      setHands(handsArray)
    } catch (error) {
      console.error('HandsList: Error fetching hands:', error)
      toast({
        title: "Error",
        description: "Failed to load hands",
        variant: "destructive",
      })
      // Set empty array on error to prevent undefined access
      setHands([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHands()
  }, [sessionId])

  const handleDeleteHand = async (handId: string) => {
    if (!handId || !sessionId) {
      console.error('HandsList: Missing handId or sessionId for deletion')
      return
    }

    try {
      console.log('HandsList: Deleting hand:', handId)
      await deleteHand(sessionId, handId)
      
      toast({
        title: "Success",
        description: "Hand deleted successfully",
      })

      // Refresh hands list and notify parent
      await fetchHands()
      onHandsChange()
    } catch (error) {
      console.error('HandsList: Error deleting hand:', error)
      toast({
        title: "Error",
        description: "Failed to delete hand",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') {
      return '$0.00'
    }
    return amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`
  }

  const formatCards = (cards: string[]) => {
    if (!Array.isArray(cards) || cards.length === 0) {
      return 'No cards'
    }
    return cards.join(', ')
  }

  const formatCommunityCards = (communityCards) => {
    if (!Array.isArray(communityCards) || communityCards.length === 0) {
      return {
        flop: 'No flop',
        turn: 'No turn', 
        river: 'No river'
      }
    }

    return {
      flop: communityCards.length >= 3 ? communityCards.slice(0, 3).join(', ') : 'No flop',
      turn: communityCards.length >= 4 ? communityCards[3] : 'No turn',
      river: communityCards.length >= 5 ? communityCards[4] : 'No river'
    }
  }

  const renderStars = (importance: number) => {
    const stars = []
    const validImportance = typeof importance === 'number' ? importance : 1
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= validImportance ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
        />
      )
    }
    return stars
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hands</CardTitle>
          <CardDescription>Loading hands...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hands</CardTitle>
        <CardDescription>
          {Array.isArray(hands) ? hands.length : 0} hands recorded in this session
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!Array.isArray(hands) || hands.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">No hands recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hands.map((hand, index) => {
              // Ensure hand is an object with required properties
              if (!hand || typeof hand !== 'object') {
                console.warn('HandsList: Invalid hand data:', hand)
                return null
              }

              return (
                <div
                  key={hand._id || index}
                  className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Hand #{index + 1}
                      </Badge>
                      <Badge variant="secondary">
                        {hand.position || 'Unknown Position'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {renderStars(hand.importance)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        (hand.result || 0) > 0 ? 'text-green-600' :
                        (hand.result || 0) < 0 ? 'text-red-600' : 'text-slate-600'
                      }`}>
                        {formatCurrency(hand.result || 0)}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Hand</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this hand? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteHand(hand._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Hole Cards:</span> {formatCards(hand.holeCards)}</p>
                      {(() => {
                        // DEBUG: Log the community cards data structure for this specific hand
                        console.log(`HandsList: Hand ${index + 1} community cards debug:`, {
                          handId: hand._id,
                          communityCards: hand.communityCards,
                          communityCardsType: typeof hand.communityCards,
                          communityCardsIsArray: Array.isArray(hand.communityCards),
                          communityCardsKeys: hand.communityCards ? Object.keys(hand.communityCards) : 'null',
                          communityCardsLength: hand.communityCards?.length,
                          rawCommunityCards: JSON.stringify(hand.communityCards),
                          hasFlop: hand.communityCards?.flop,
                          hasTurn: hand.communityCards?.turn,
                          hasRiver: hand.communityCards?.river
                        })

                        // Try both possible data structures
                        let flopDisplay, turnDisplay, riverDisplay

                        if (Array.isArray(hand.communityCards)) {
                          // Community cards stored as flat array
                          console.log(`HandsList: Hand ${index + 1} using flat array format`)
                          flopDisplay = hand.communityCards.length >= 3 ? hand.communityCards.slice(0, 3).join(', ') : 'No flop'
                          turnDisplay = hand.communityCards.length >= 4 ? hand.communityCards[3] : 'No turn'
                          riverDisplay = hand.communityCards.length >= 5 ? hand.communityCards[4] : 'No river'
                        } else if (hand.communityCards && typeof hand.communityCards === 'object') {
                          // Community cards stored as object with flop/turn/river
                          console.log(`HandsList: Hand ${index + 1} using object format`)
                          flopDisplay = Array.isArray(hand.communityCards.flop) && hand.communityCards.flop.length > 0 
                            ? hand.communityCards.flop.join(', ') 
                            : 'No flop'
                          turnDisplay = hand.communityCards.turn || 'No turn'
                          riverDisplay = hand.communityCards.river || 'No river'
                        } else {
                          // No community cards data
                          console.log(`HandsList: Hand ${index + 1} has no community cards data`)
                          flopDisplay = 'No flop'
                          turnDisplay = 'No turn'
                          riverDisplay = 'No river'
                        }

                        console.log(`HandsList: Hand ${index + 1} final display values:`, {
                          flopDisplay,
                          turnDisplay,
                          riverDisplay
                        })

                        return (
                          <>
                            <p><span className="font-medium">Flop:</span> {flopDisplay}</p>
                            <p><span className="font-medium">Turn:</span> {turnDisplay}</p>
                            <p><span className="font-medium">River:</span> {riverDisplay}</p>
                          </>
                        )
                      })()}
                    </div>
                    <div>
                      <p><span className="font-medium">Tags:</span> {
                        Array.isArray(hand.tags) && hand.tags.length > 0 
                          ? hand.tags.join(', ') 
                          : 'No tags'
                      }</p>
                      <p><span className="font-medium">Time:</span> {
                        hand.createdAt 
                          ? new Date(hand.createdAt).toLocaleTimeString() 
                          : 'Unknown'
                      }</p>
                    </div>
                  </div>

                  {hand.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-medium">Notes:</span> {hand.notes}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}