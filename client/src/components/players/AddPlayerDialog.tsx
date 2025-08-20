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
import { Badge } from '@/components/ui/badge'
import { Player } from '@/api/players'
import { X } from 'lucide-react'

interface AddPlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddPlayer: (player: Partial<Player>) => void
}

const commonTags = [
  'Tight', 'Loose', 'Aggressive', 'Passive', 'Bluffer', 'Calling Station',
  'Rock', 'Maniac', 'TAG', 'LAG', 'Nit', 'Fish', 'Reg', 'Thinking Player'
]

export function AddPlayerDialog({ open, onOpenChange, onAddPlayer }: AddPlayerDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    venue: '',
    notes: '',
    tags: [] as string[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting player form:', formData)

    onAddPlayer({
      name: formData.name,
      alias: formData.alias || undefined,
      venue: formData.venue,
      notes: formData.notes,
      tags: formData.tags
    })

    // Reset form
    setFormData({
      name: '',
      alias: '',
      venue: '',
      notes: '',
      tags: []
    })
  }

  const handleTagClick = (tag: string) => {
    if (formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
          <DialogDescription>
            Add a new player to your database with notes and playing style tags.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Player Name *</Label>
              <Input
                id="name"
                placeholder="Player123"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alias">Alias/Nickname</Label>
              <Input
                id="alias"
                placeholder="The Fish"
                value={formData.alias}
                onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Select value={formData.venue} onValueChange={(value) => setFormData(prev => ({ ...prev, venue: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PokerStars">PokerStars</SelectItem>
                <SelectItem value="888poker">888poker</SelectItem>
                <SelectItem value="PartyPoker">PartyPoker</SelectItem>
                <SelectItem value="GGPoker">GGPoker</SelectItem>
                <SelectItem value="Live Casino">Live Casino</SelectItem>
                <SelectItem value="Home Game">Home Game</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Playing Style Tags</Label>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="default" className="bg-blue-500">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {commonTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                  size="sm"
                  className={`text-xs ${
                    formData.tags.includes(tag)
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : ''
                  }`}
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Playing tendencies, weaknesses, exploits, etc."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
              Add Player
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}