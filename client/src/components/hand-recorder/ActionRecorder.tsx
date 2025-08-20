import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface ActionRecorderProps {
  actions: any[]
  onActionAdd: (action: any) => void
}

export function ActionRecorder({ actions, onActionAdd }: ActionRecorderProps) {
  const [actionType, setActionType] = useState('')
  const [amount, setAmount] = useState('')
  const [street, setStreet] = useState('preflop')

  const handleActionAdd = () => {
    if (!actionType) {
      console.log('ActionRecorder: No action type selected')
      return
    }

    const action = {
      type: actionType,
      amount: amount ? parseFloat(amount) : 0,
      street: street,
      timestamp: new Date().toISOString()
    }

    console.log('ActionRecorder: Adding action:', action)

    if (typeof onActionAdd !== 'function') {
      console.error('ActionRecorder: onActionAdd is not a function')
      return
    }

    try {
      onActionAdd(action)
      console.log('ActionRecorder: Action added successfully')
      
      // Reset form
      setActionType('')
      setAmount('')
    } catch (error) {
      console.error('ActionRecorder: Error adding action:', error)
    }
  }

  const actionTypes = [
    { value: 'fold', label: 'Fold', color: 'bg-red-500 hover:bg-red-600 text-white border-red-500' },
    { value: 'check', label: 'Check', color: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' },
    { value: 'call', label: 'Call', color: 'bg-green-500 hover:bg-green-600 text-white border-green-500' },
    { value: 'bet', label: 'Bet', color: 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500' },
    { value: 'raise', label: 'Raise', color: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' },
    { value: 'all-in', label: 'All-In', color: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500' }
  ]

  const streets = [
    { value: 'preflop', label: 'Pre-flop', color: 'bg-purple-100 text-purple-800' },
    { value: 'flop', label: 'Flop', color: 'bg-blue-100 text-blue-800' },
    { value: 'turn', label: 'Turn', color: 'bg-green-100 text-green-800' },
    { value: 'river', label: 'River', color: 'bg-orange-100 text-orange-800' }
  ]

  return (
    <div className="space-y-4">
      {/* Existing Actions Display */}
      {actions && actions.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200">
          <h4 className="font-medium mb-3 text-slate-800">Recorded Actions ({actions.length})</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {actions.map((action, index) => {
              const actionTypeInfo = actionTypes.find(at => at.value === action.type)
              const streetInfo = streets.find(s => s.value === action.street)

              return (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border">
                  <Badge
                    variant="secondary"
                    className={streetInfo?.color || 'bg-gray-100 text-gray-800'}
                  >
                    {streetInfo?.label || action.street || 'preflop'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-800 font-medium"
                  >
                    {actionTypeInfo?.label || action.type || 'Unknown'}
                  </Badge>
                  {action.amount > 0 && (
                    <span className="text-sm font-bold text-green-600">${action.amount}</span>
                  )}
                  {action.timestamp && (
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(action.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Add New Action */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h4 className="font-medium mb-3 text-blue-800">Record Action</h4>

        <div className="space-y-4">
          {/* Street Selection */}
          <div>
            <Label className="text-sm font-medium text-slate-700">Current Street</Label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {streets.map((s) => (
                <Button
                  key={s.value}
                  type="button"
                  variant={street === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStreet(s.value)}
                  className={street === s.value ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Type Selection */}
          <div>
            <Label className="text-sm font-medium text-slate-700">Action Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {actionTypes.map((at) => (
                <Button
                  key={at.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActionType(at.value)}
                  className={
                    actionType === at.value 
                      ? `${at.color} shadow-lg transform scale-105 transition-all duration-200` 
                      : 'hover:scale-105 transition-all duration-200 border-2 hover:shadow-md'
                  }
                >
                  {at.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Amount Input (for bet/raise/call) */}
          {(actionType === 'bet' || actionType === 'raise' || actionType === 'call') && (
            <div className="bg-white p-3 rounded-lg border-2 border-green-200">
              <Label htmlFor="amount" className="text-sm font-medium text-green-700">
                Amount ($)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 border-green-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          )}

          {/* Add Action Button */}
          <Button
            type="button"
            onClick={handleActionAdd}
            disabled={!actionType}
            className={`w-full py-3 font-bold text-lg transition-all duration-200 ${
              actionType 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {actionType ? `Record ${actionTypes.find(at => at.value === actionType)?.label}` : 'Select Action Type'}
          </Button>
        </div>
      </Card>

      {/* Instructions */}
      <div className="text-sm text-slate-600 dark:text-slate-400 bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-lg border border-slate-200">
        <p className="font-medium mb-2 text-slate-800">📝 How to record actions:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600">
          <li>Select the current street (pre-flop, flop, turn, river)</li>
          <li>Choose the action type with colorful buttons</li>
          <li>Enter amount for bets, raises, and calls</li>
          <li>Click the record button to save the action</li>
        </ol>
        {actions && actions.length > 0 && (
          <p className="mt-3 text-green-700 dark:text-green-300 text-sm font-medium">
            ✅ {actions.length} action{actions.length !== 1 ? 's' : ''} recorded successfully
          </p>
        )}
      </div>
    </div>
  )
}