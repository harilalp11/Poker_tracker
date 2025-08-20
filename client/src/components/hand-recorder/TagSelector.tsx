import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

const commonTags = [
  'Bluff',
  'Value Bet',
  'Semi-bluff',
  'Bad Beat',
  'Cooler',
  'Nuts',
  'Draw',
  'Fold Equity',
  'Pot Control',
  'Thin Value',
  'Protection',
  'Slowplay'
]

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('')

  const handleTagToggle = (tag: string) => {
    if (!Array.isArray(selectedTags)) {
      return
    }

    if (typeof onTagsChange !== 'function') {
      return
    }

    let newTags
    if (selectedTags.includes(tag)) {
      // Remove tag
      newTags = selectedTags.filter(t => t !== tag)
    } else {
      // Add tag
      newTags = [...selectedTags, tag]
    }

    onTagsChange(newTags)
  }

  const handleCustomTagAdd = () => {
    if (!customTag.trim()) {
      return
    }

    if (selectedTags?.includes(customTag.trim())) {
      return
    }

    const newTags = [...(selectedTags || []), customTag.trim()]
    onTagsChange(newTags)
    setCustomTag('')
  }

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = selectedTags?.filter(tag => tag !== tagToRemove) || []
    onTagsChange(newTags)
  }

  return (
    <div className="space-y-4">
      {/* Selected Tags Display */}
      {selectedTags && selectedTags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Tags ({selectedTags.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag, index) => (
              <Badge
                key={index}
                variant="default"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
              >
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-1 hover:bg-blue-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Common Tags */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Common Tags</h4>
        <div className="grid grid-cols-3 gap-2">
          {commonTags.map((tag) => {
            const isSelected = selectedTags?.includes(tag) || false

            return (
              <Button
                key={tag}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagToggle(tag)}
                className={`text-xs ${isSelected ? 'bg-blue-600 text-white' : ''}`}
              >
                {tag}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Custom Tag Input */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Add Custom Tag</h4>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter custom tag..."
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomTagAdd()
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleCustomTagAdd}
            disabled={!customTag.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
        <p className="font-medium mb-1">How to use tags:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Click common tags to select/deselect them</li>
          <li>Add custom tags using the input field</li>
          <li>Remove tags by clicking the × button</li>
          <li>Tags help categorize and analyze your hands later</li>
        </ul>
        {selectedTags && selectedTags.length > 0 && (
          <p className="mt-2 text-green-700 dark:text-green-300 text-xs">
            ✓ {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  )
}