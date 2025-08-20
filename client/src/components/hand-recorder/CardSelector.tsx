import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface CardSelectorProps {
  selectedCards: string[]
  onCardsChange: (cards: string[]) => void
  maxCards: number
  onClose?: () => void
}

const suits = [
  { symbol: '♠', name: 'Spades', color: 'text-slate-900' },
  { symbol: '♥', name: 'Hearts', color: 'text-red-600' },
  { symbol: '♦', name: 'Diamonds', color: 'text-red-600' },
  { symbol: '♣', name: 'Clubs', color: 'text-slate-900' }
]
const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']

export function CardSelector({ selectedCards, onCardsChange, maxCards, onClose }: CardSelectorProps) {
  console.log('CardSelector: Component rendering')
  console.log('CardSelector: Props received - selectedCards:', selectedCards, 'maxCards:', maxCards)

  const [selectedSuit, setSelectedSuit] = useState<string | null>(null)
  const [internalSelectedCards, setInternalSelectedCards] = useState<string[]>(selectedCards || [])

  // Ensure maxCards has a default value to prevent undefined comparisons
  const safeMaxCards = maxCards || 2

  useEffect(() => {
    console.log('CardSelector: Initializing internal state with:', selectedCards)
    setInternalSelectedCards(selectedCards || [])
  }, [selectedCards])

  const handleCardClick = useCallback((card: string) => {
    console.log('CardSelector: handleCardClick called for card:', card)
    console.log('CardSelector: Current internal selection:', internalSelectedCards)
    console.log('CardSelector: Max cards allowed:', safeMaxCards)

    let newSelectedCards: string[]

    if (internalSelectedCards.includes(card)) {
      newSelectedCards = internalSelectedCards.filter(c => c !== card)
      console.log('CardSelector: Removing card, new selection:', newSelectedCards)
    } else if (internalSelectedCards.length < safeMaxCards) {
      newSelectedCards = [...internalSelectedCards, card]
      console.log('CardSelector: Adding card, new selection:', newSelectedCards)
    } else {
      console.log('CardSelector: At max limit, not adding card')
      return
    }

    console.log('CardSelector: Updating internal state to:', newSelectedCards)
    setInternalSelectedCards(newSelectedCards)
  }, [internalSelectedCards, safeMaxCards])

  const isCardSelected = useCallback((card: string) => {
    const isSelected = internalSelectedCards.includes(card)
    return isSelected
  }, [internalSelectedCards])

  const handleSuitClick = useCallback((suitSymbol: string) => {
    console.log('CardSelector: Suit selected:', suitSymbol)
    const newSuit = suitSymbol === selectedSuit ? null : suitSymbol
    setSelectedSuit(newSuit)
  }, [selectedSuit])

  const handleConfirm = useCallback(() => {
    console.log('CardSelector: Confirm button clicked')
    console.log('CardSelector: Confirming selection:', internalSelectedCards)

    if (onCardsChange) {
      console.log('CardSelector: Calling onCardsChange with:', internalSelectedCards)
      onCardsChange(internalSelectedCards)
    }
  }, [internalSelectedCards, onCardsChange])

  const handleCancel = useCallback(() => {
    console.log('CardSelector: Cancel button clicked')
    console.log('CardSelector: Resetting to original selection:', selectedCards)
    setInternalSelectedCards(selectedCards || [])
    if (onClose) {
      onClose()
    }
  }, [selectedCards, onClose])

  const suitButtons = useMemo(() => {
    return suits.map((suit) => (
      <Button
        key={suit.symbol}
        variant={selectedSuit === suit.symbol ? "default" : "outline"}
        size="lg"
        onClick={() => handleSuitClick(suit.symbol)}
        className={`min-w-[120px] h-12 ${suit.color} ${
          selectedSuit === suit.symbol ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
        }`}
      >
        <span className="text-2xl mr-2">{suit.symbol}</span>
        {suit.name}
      </Button>
    ))
  }, [selectedSuit, handleSuitClick])

  const rankButtons = useMemo(() => {
    if (!selectedSuit) {
      return null
    }

    const selectedSuitData = suits.find(s => s.symbol === selectedSuit)
    if (!selectedSuitData) {
      return null
    }

    return (
      <div className="space-y-3">
        <h4 className={`text-lg font-medium ${selectedSuitData.color}`}>
          <span className="text-2xl mr-2">{selectedSuit}</span>
          {selectedSuitData.name} - Select Rank
        </h4>
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2">
          {ranks.map((rank) => {
            const card = `${rank}${selectedSuit}`
            const selected = isCardSelected(card)
            const disabled = !selected && internalSelectedCards.length >= safeMaxCards

            return (
              <Button
                key={card}
                variant={selected ? "default" : "outline"}
                size="sm"
                disabled={disabled}
                onClick={() => handleCardClick(card)}
                className={`min-w-[3rem] h-10 ${selectedSuitData.color} ${
                  selected ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
                } ${
                  disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="font-bold">{rank}</span>
              </Button>
            )
          })}
        </div>
      </div>
    )
  }, [selectedSuit, internalSelectedCards, safeMaxCards, handleCardClick, isCardSelected])

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Select Cards ({internalSelectedCards.length}/{safeMaxCards})
        </h3>
        {onClose && (
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Selected Cards ({internalSelectedCards.length}/{safeMaxCards})
          </h4>
          <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
            {internalSelectedCards.length === 0 ? (
              <span className="text-slate-500 text-sm">No cards selected</span>
            ) : (
              internalSelectedCards.map((card) => {
                const suit = card.slice(-1)
                const rank = card.slice(0, -1)
                const suitData = suits.find(s => s.symbol === suit)
                return (
                  <Badge
                    key={card}
                    variant="default"
                    className={`px-3 py-1 text-base ${suitData?.color || ''} bg-white border-2 border-blue-200`}
                  >
                    <span className="font-bold">{rank}</span>
                    <span className="text-lg ml-1">{suit}</span>
                  </Badge>
                )
              })
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Step 1: Choose a Suit
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {suitButtons}
          </div>
        </div>

        {selectedSuit && (
          <div className="space-y-3">
            <div className="border-t pt-4">
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-3">
                Step 2: Choose a Rank
              </h4>
              {rankButtons}
            </div>
          </div>
        )}

        <div className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="font-medium mb-1">How to select cards:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>First, click on a suit (♠ ♥ ♦ ♣) above</li>
            <li>Then, click on the rank you want from that suit</li>
            <li>Repeat until you've selected {safeMaxCards} card{safeMaxCards > 1 ? 's' : ''}</li>
            <li><strong>Click "Confirm Selection" when done</strong></li>
          </ol>
          {internalSelectedCards.length > 0 && (
            <p className="mt-2 text-green-700 dark:text-green-300">
              ✓ {internalSelectedCards.length} of {safeMaxCards} cards selected
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={internalSelectedCards.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Confirm Selection ({internalSelectedCards.length}/{safeMaxCards})
          </Button>
        </div>
      </div>
    </div>
  )
}