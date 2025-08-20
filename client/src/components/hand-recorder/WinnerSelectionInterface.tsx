import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface Player {
  id: string
  name: string
  position: string
  stack: number
  totalInvested: number
}

interface Winner {
  playerId: string
  playerName: string
  amount: number
}

interface WinnerSelectionInterfaceProps {
  players: Player[]
  potSize: number
  onWinnersSelected: (winners: Winner[]) => void
}

export function WinnerSelectionInterface({ players, potSize, onWinnersSelected }: WinnerSelectionInterfaceProps) {
  const [selectedWinners, setSelectedWinners] = useState<Set<string>>(new Set())
  const [winAmounts, setWinAmounts] = useState<Record<string, number>>({})

  const handlePlayerSelect = (playerId: string, checked: boolean) => {
    const newSelected = new Set(selectedWinners)
    if (checked) {
      newSelected.add(playerId)
      // Default to equal split of remaining pot
      const remainingPot = potSize - Object.values(winAmounts).reduce((sum, amount) => sum + amount, 0)
      const defaultAmount = remainingPot / (newSelected.size)
      setWinAmounts(prev => ({ ...prev, [playerId]: Math.round(defaultAmount * 100) / 100 }))
    } else {
      newSelected.delete(playerId)
      setWinAmounts(prev => {
        const { [playerId]: removed, ...rest } = prev
        return rest
      })
    }
    setSelectedWinners(newSelected)
  }

  const handleAmountChange = (playerId: string, amount: number) => {
    setWinAmounts(prev => ({ ...prev, [playerId]: amount }))
  }

  const handleConfirm = () => {
    const winners: Winner[] = Array.from(selectedWinners).map(playerId => {
      const player = players.find(p => p.id === playerId)
      return {
        playerId,
        playerName: player?.name || 'Unknown',
        amount: winAmounts[playerId] || 0
      }
    })
    onWinnersSelected(winners)
  }

  const totalWinnings = Object.values(winAmounts).reduce((sum, amount) => sum + amount, 0)
  const isValidSelection = selectedWinners.size > 0 && Math.abs(totalWinnings - potSize) < 0.01

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-lg font-semibold">Total Pot: ${potSize}</p>
        <p className="text-sm text-gray-600">Select winner(s) and distribute the pot</p>
      </div>

      <div className="space-y-3">
        {players.map((player) => (
          <Card key={player.id} className={selectedWinners.has(player.id) ? 'ring-2 ring-green-500' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedWinners.has(player.id)}
                    onCheckedChange={(checked) => handlePlayerSelect(player.id, checked as boolean)}
                  />
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-gray-500">{player.position}</div>
                  </div>
                </div>
                
                {selectedWinners.has(player.id) && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`amount-${player.id}`} className="text-sm">Win Amount:</Label>
                    <Input
                      id={`amount-${player.id}`}
                      type="number"
                      step="0.01"
                      value={winAmounts[player.id] || 0}
                      onChange={(e) => handleAmountChange(player.id, parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span>Total Winnings: ${totalWinnings.toFixed(2)}</span>
          <span className={totalWinnings === potSize ? 'text-green-600' : 'text-red-600'}>
            {totalWinnings === potSize ? '✓ Matches pot' : `Difference: $${(potSize - totalWinnings).toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => {
              // Quick split pot equally among selected winners
              if (selectedWinners.size > 0) {
                const equalAmount = potSize / selectedWinners.size
                const newAmounts: Record<string, number> = {}
                selectedWinners.forEach(playerId => {
                  newAmounts[playerId] = Math.round(equalAmount * 100) / 100
                })
                setWinAmounts(newAmounts)
              }
            }}
            variant="outline"
            disabled={selectedWinners.size === 0}
          >
            Split Equally
          </Button>
          
          <Button
            onClick={handleConfirm}
            disabled={!isValidSelection}
            className="flex-1"
          >
            Confirm Winners
          </Button>
        </div>
      </div>
    </div>
  )
}