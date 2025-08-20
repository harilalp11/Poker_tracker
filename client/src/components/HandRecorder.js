import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from './ui/use-toast';

const HandRecorder = () => {
  const [handData, setHandData] = useState({
    position: '',
    holeCards: '',
    action: '',
    betAmount: '',
    potSize: '',
    boardCards: '',
    result: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const positions = [
    'UTG', 'UTG+1', 'MP1', 'MP2', 'HJ', 'CO', 'BTN', 'SB', 'BB'
  ];

  const actions = [
    'Fold', 'Call', 'Raise', 'Check', 'Bet', 'All-in'
  ];

  const results = [
    'Won', 'Lost', 'Folded'
  ];

  const handleInputChange = (field, value) => {
    console.log(`HandRecorder: Updating ${field} to:`, value);
    setHandData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('HandRecorder: Submitting hand data:', handData);
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!handData.position || !handData.holeCards || !handData.action) {
        throw new Error('Position, hole cards, and action are required');
      }

      // Here we would typically call an API to save the hand data
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('HandRecorder: Hand recorded successfully');
      
      toast({
        title: "Success",
        description: "Hand recorded successfully"
      });

      // Reset form
      setHandData({
        position: '',
        holeCards: '',
        action: '',
        betAmount: '',
        potSize: '',
        boardCards: '',
        result: '',
        notes: ''
      });

    } catch (error) {
      console.error('HandRecorder: Error recording hand:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record hand"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Record Hand</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Position *</Label>
                <Select 
                  value={handData.position} 
                  onValueChange={(value) => handleInputChange('position', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map(position => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="holeCards">Hole Cards *</Label>
                <Input
                  id="holeCards"
                  value={handData.holeCards}
                  onChange={(e) => handleInputChange('holeCards', e.target.value)}
                  placeholder="e.g., AhKs"
                />
              </div>

              <div>
                <Label htmlFor="action">Action *</Label>
                <Select 
                  value={handData.action} 
                  onValueChange={(value) => handleInputChange('action', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actions.map(action => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="betAmount">Bet Amount</Label>
                <Input
                  id="betAmount"
                  type="number"
                  step="0.01"
                  value={handData.betAmount}
                  onChange={(e) => handleInputChange('betAmount', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="potSize">Pot Size</Label>
                <Input
                  id="potSize"
                  type="number"
                  step="0.01"
                  value={handData.potSize}
                  onChange={(e) => handleInputChange('potSize', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="boardCards">Board Cards</Label>
                <Input
                  id="boardCards"
                  value={handData.boardCards}
                  onChange={(e) => handleInputChange('boardCards', e.target.value)}
                  placeholder="e.g., AhKs7d"
                />
              </div>

              <div>
                <Label htmlFor="result">Result</Label>
                <Select 
                  value={handData.result} 
                  onValueChange={(value) => handleInputChange('result', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    {results.map(result => (
                      <SelectItem key={result} value={result}>
                        {result}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={handData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about the hand..."
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Recording...' : 'Record Hand'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HandRecorder;