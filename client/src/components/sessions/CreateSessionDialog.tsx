import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CreateSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateSession: (sessionData: any) => void
}

export function CreateSessionDialog({ open, onOpenChange, onCreateSession }: CreateSessionDialogProps) {
  const [formData, setFormData] = useState({
    venue: '',
    stakes: '',
    gameType: 'Texas Hold\'em',
    tableSize: '6-max',
    buyIn: '',
    cashOut: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log('=== SESSION CREATION DEBUG START ===')
    console.log('CreateSessionDialog: Form submission started')
    console.log('CreateSessionDialog: Raw form data:', JSON.stringify(formData, null, 2))

    // FIXED: Ensure date is always included and properly formatted
    const currentDate = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    console.log('CreateSessionDialog: Generated date:', currentDate)

    // FIXED: Ensure cashOut defaults to buyIn if not provided
    const cashOutValue = formData.cashOut ? parseFloat(formData.cashOut) : parseFloat(formData.buyIn) || 0

    // FIXED: Ensure all required fields are properly set with correct types
    const sessionData = {
      date: currentDate, // Always include date first
      venue: formData.venue || '', // Ensure string
      stakes: formData.stakes || '', // Ensure string
      gameType: formData.gameType || 'Texas Hold\'em', // Ensure string with default
      tableSize: formData.tableSize || '6-max', // Ensure string with default
      buyIn: parseFloat(formData.buyIn) || 0, // Ensure number
      cashOut: cashOutValue, // Ensure number
      notes: formData.notes || '' // Ensure string
    }

    console.log('CreateSessionDialog: Final session data structure:', JSON.stringify(sessionData, null, 2))
    console.log('CreateSessionDialog: Date field verification:', {
      hasDate: sessionData.hasOwnProperty('date'),
      dateValue: sessionData.date,
      dateType: typeof sessionData.date,
      dateLength: sessionData.date?.length,
      isValidDate: sessionData.date && sessionData.date.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(sessionData.date)
    })

    // Additional validation to prevent the error
    if (!sessionData.date) {
      console.error('CreateSessionDialog: CRITICAL ERROR - Date is missing!')
      return
    }

    if (typeof sessionData.date !== 'string' || sessionData.date.length !== 10) {
      console.error('CreateSessionDialog: CRITICAL ERROR - Date format is invalid!')
      return
    }

    console.log('CreateSessionDialog: About to call onCreateSession')
    onCreateSession(sessionData)
    console.log('CreateSessionDialog: onCreateSession call completed')
    console.log('=== SESSION CREATION DEBUG END ===')

    // Reset form
    setFormData({
      venue: '',
      stakes: '',
      gameType: 'Texas Hold\'em',
      tableSize: '6-max',
      buyIn: '',
      cashOut: '',
      notes: ''
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Start a new poker session by filling in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Select value={formData.venue} onValueChange={(value) => setFormData({ ...formData, venue: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PokerStars">PokerStars</SelectItem>
                <SelectItem value="888poker">888poker</SelectItem>
                <SelectItem value="partypoker">partypoker</SelectItem>
                <SelectItem value="GGPoker">GGPoker</SelectItem>
                <SelectItem value="Live Casino">Live Casino</SelectItem>
                <SelectItem value="Home Game">Home Game</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stakes">Stakes</Label>
            <Input
              id="stakes"
              placeholder="e.g., $1/$2, $0.50/$1.00"
              value={formData.stakes}
              onChange={(e) => setFormData({ ...formData, stakes: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gameType">Game Type</Label>
              <Select value={formData.gameType} onValueChange={(value) => setFormData({ ...formData, gameType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Texas Hold'em">Texas Hold'em</SelectItem>
                  <SelectItem value="Omaha">Omaha</SelectItem>
                  <SelectItem value="Omaha Hi-Lo">Omaha Hi-Lo</SelectItem>
                  <SelectItem value="Seven Card Stud">Seven Card Stud</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableSize">Table Size</Label>
              <Select value={formData.tableSize} onValueChange={(value) => setFormData({ ...formData, tableSize: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heads-up">Heads-up</SelectItem>
                  <SelectItem value="6-max">6-max</SelectItem>
                  <SelectItem value="9-max">9-max</SelectItem>
                  <SelectItem value="10-max">10-max</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyIn">Buy-in Amount ($)</Label>
            <Input
              id="buyIn"
              type="number"
              placeholder="200"
              step="0.01"
              value={formData.buyIn}
              onChange={(e) => setFormData({ ...formData, buyIn: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cashOut">Cash-out Amount ($) - Optional</Label>
            <Input
              id="cashOut"
              type="number"
              placeholder="Will default to buy-in amount"
              step="0.01"
              value={formData.cashOut}
              onChange={(e) => setFormData({ ...formData, cashOut: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this session..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Session</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}