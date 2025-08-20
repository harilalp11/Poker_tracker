import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/useToast'
import { getSessionById, endSession } from '@/api/sessions'
import { HandsList } from '@/components/sessions/HandsList'
import {
  ArrowLeft,
  Play,
  Square,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Plus
} from 'lucide-react'

export function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = async () => {
    if (!id) return

    try {
      console.log('SessionDetail: Fetching session:', id)
      const data = await getSessionById(id)
      console.log('SessionDetail: Session data received:', JSON.stringify(data, null, 2))
      console.log('SessionDetail: Session profit:', data.session.profit, 'type:', typeof data.session.profit)
      console.log('SessionDetail: Session hands played:', data.session.handsPlayed)
      setSession(data.session)
    } catch (error) {
      console.error('SessionDetail: Error fetching session:', error)
      toast({
        title: "Error",
        description: "Failed to load session",
        variant: "destructive",
      })
      navigate('/sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [id, navigate, toast])

  const handleEndSession = async () => {
    if (!session) return

    try {
      console.log('SessionDetail: Ending session:', session._id)
      await endSession(session._id)
      
      toast({
        title: "Success",
        description: "Session ended successfully",
      })

      // Refresh session data
      await fetchSession()
    } catch (error) {
      console.error('SessionDetail: Error ending session:', error)
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0m'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
      console.log('SessionDetail: formatCurrency received non-number:', amount, 'type:', typeof amount)
      return '$0.00'
    }
    return amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
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

  console.log('SessionDetail: Rendering session:', {
    profit: session.profit,
    handsPlayed: session.handsPlayed,
    status: session.status
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/sessions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{session.venue || 'Unknown Venue'}</h1>
            <p className="text-slate-600 dark:text-slate-400">
              {session.stakes || 'Unknown Stakes'} • {session.gameType || 'Unknown Game'} • {session.tableSize || 'Unknown Size'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {session.status === 'active' && (
            <>
              <Button onClick={() => navigate(`/sessions/${id}/record-hand`)}>
                <Plus className="h-4 w-4 mr-2" />
                Record Hand
              </Button>
              <Button variant="destructive" onClick={handleEndSession}>
                <Square className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </>
          )}
          {session.status === 'completed' && (
            <div>
              <Badge variant="secondary">Completed</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Profit/Loss
                </p>
                <p className={`text-2xl font-bold ${
                  (session.profit || 0) > 0 ? 'text-green-600' :
                  (session.profit || 0) < 0 ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {formatCurrency(session.profit || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Hands Played
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {session.handsPlayed || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Duration
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatDuration(session.duration)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Buy-in
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ${(session.buyIn || 0).toFixed(2)}
                </p>
              </div>
              <Target className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            Started on {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Unknown date'} at{' '}
            {session.createdAt ? new Date(session.createdAt).toLocaleTimeString() : 'Unknown time'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p><span className="font-medium">Date:</span> {session.date || 'Unknown'}</p>
              <p><span className="font-medium">Venue:</span> {session.venue || 'Unknown'}</p>
              <p><span className="font-medium">Stakes:</span> {session.stakes || 'Unknown'}</p>
              <p><span className="font-medium">Game Type:</span> {session.gameType || 'Unknown'}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Table Size:</span> {session.tableSize || 'Unknown'}</p>
              <p><span className="font-medium">Buy-in:</span> ${(session.buyIn || 0).toFixed(2)}</p>
              <p><span className="font-medium">Cash-out:</span> ${(session.cashOut || 0).toFixed(2)}</p>
              <div className="flex items-center">
                <span className="font-medium">Status:</span>
                <Badge variant={session.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                  {session.status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>
          {session.notes && (
            <div className="mt-4">
              <p className="font-medium mb-2">Notes:</p>
              <p className="text-slate-600 dark:text-slate-400">{session.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hands List */}
      <HandsList sessionId={id} onHandsChange={fetchSession} />
    </div>
  )
}