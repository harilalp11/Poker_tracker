import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getWinRateStats, getVPIPStats, getPFRStats } from '@/api/analytics'
import { useToast } from '@/hooks/useToast'

export function StatisticsTest() {
  const [winRateStats, setWinRateStats] = useState(null)
  const [vpipStats, setVPIPStats] = useState(null)
  const [pfrStats, setPFRStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const testWinRate = async () => {
    console.log('Testing Win Rate endpoint...')
    setLoading(true)
    try {
      const data = await getWinRateStats()
      console.log('Win Rate response:', data)
      setWinRateStats(data.data)
      toast({
        title: "Success",
        description: "Win rate statistics loaded successfully",
      })
    } catch (error) {
      console.error('Win Rate error:', error)
      toast({
        title: "Error",
        description: "Failed to load win rate statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testVPIP = async () => {
    console.log('Testing VPIP endpoint...')
    setLoading(true)
    try {
      const data = await getVPIPStats()
      console.log('VPIP response:', data)
      setVPIPStats(data.data)
      toast({
        title: "Success",
        description: "VPIP statistics loaded successfully",
      })
    } catch (error) {
      console.error('VPIP error:', error)
      toast({
        title: "Error",
        description: "Failed to load VPIP statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testPFR = async () => {
    console.log('Testing PFR endpoint...')
    setLoading(true)
    try {
      const data = await getPFRStats()
      console.log('PFR response:', data)
      setPFRStats(data.data)
      toast({
        title: "Success",
        description: "PFR statistics loaded successfully",
      })
    } catch (error) {
      console.error('PFR error:', error)
      toast({
        title: "Error",
        description: "Failed to load PFR statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const testAllEndpoints = async () => {
    await testWinRate()
    await testVPIP()
    await testPFR()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Statistics API Test</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Test individual statistics endpoints
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={testWinRate} disabled={loading}>
          Test Win Rate
        </Button>
        <Button onClick={testVPIP} disabled={loading}>
          Test VPIP
        </Button>
        <Button onClick={testPFR} disabled={loading}>
          Test PFR
        </Button>
        <Button onClick={testAllEndpoints} disabled={loading}>
          Test All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Win Rate Statistics</CardTitle>
            <CardDescription>GET /api/statistics/win-rate</CardDescription>
          </CardHeader>
          <CardContent>
            {winRateStats ? (
              <div className="space-y-2">
                <p><strong>Total Hands:</strong> {winRateStats.totalHands}</p>
                <p><strong>Won Hands:</strong> {winRateStats.wonHands}</p>
                <p><strong>Win Rate:</strong> {winRateStats.winRate}%</p>
              </div>
            ) : (
              <p className="text-slate-500">No data loaded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>VPIP Statistics</CardTitle>
            <CardDescription>GET /api/statistics/vpip</CardDescription>
          </CardHeader>
          <CardContent>
            {vpipStats ? (
              <div className="space-y-2">
                <p><strong>Total Hands:</strong> {vpipStats.totalHands}</p>
                <p><strong>VPIP Hands:</strong> {vpipStats.vpipHands}</p>
                <p><strong>VPIP Rate:</strong> {vpipStats.vpipRate}%</p>
              </div>
            ) : (
              <p className="text-slate-500">No data loaded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PFR Statistics</CardTitle>
            <CardDescription>GET /api/statistics/pfr</CardDescription>
          </CardHeader>
          <CardContent>
            {pfrStats ? (
              <div className="space-y-2">
                <p><strong>Total Hands:</strong> {pfrStats.totalHands}</p>
                <p><strong>PFR Hands:</strong> {pfrStats.pfrHands}</p>
                <p><strong>PFR Rate:</strong> {pfrStats.pfrRate}%</p>
              </div>
            ) : (
              <p className="text-slate-500">No data loaded</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raw Response Data</CardTitle>
          <CardDescription>JSON responses from each endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Win Rate Response:</h4>
              <pre className="bg-slate-100 p-2 rounded text-sm overflow-auto">
                {winRateStats ? JSON.stringify({ data: winRateStats }, null, 2) : 'No data'}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">VPIP Response:</h4>
              <pre className="bg-slate-100 p-2 rounded text-sm overflow-auto">
                {vpipStats ? JSON.stringify({ data: vpipStats }, null, 2) : 'No data'}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">PFR Response:</h4>
              <pre className="bg-slate-100 p-2 rounded text-sm overflow-auto">
                {pfrStats ? JSON.stringify({ data: pfrStats }, null, 2) : 'No data'}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}