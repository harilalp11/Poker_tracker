import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getSessions } from '@/api/sessions'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import {
  Search,
  Plus,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react'
import { CreateSessionDialog } from '@/components/sessions/CreateSessionDialog'

export function Sessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        console.log('Sessions: Loading sessions...')
        const data = await getSessions()
        console.log('Sessions: Raw sessions data received:', data)
        console.log('Sessions: Sessions array:', data.sessions)
        
        // Log each session ID to identify fake ones
        if (data.sessions && Array.isArray(data.sessions)) {
          data.sessions.forEach((session, index) => {
            console.log(`Sessions: Session ${index + 1} ID:`, session._id, 'Type:', typeof session._id, 'Length:', session._id?.length)
            console.log(`Sessions: Session ${index + 1} venue:`, session.venue)
            console.log(`Sessions: Session ${index + 1} stakes:`, session.stakes)
          })
        }
        
        setSessions(data.sessions || [])
      } catch (error) {
        console.error('Sessions: Error loading sessions:', error)
        toast({
          title: "Error",
          description: "Failed to load sessions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [toast])

  const handleSessionClick = (sessionId) => {
    console.log('Sessions: Navigating to session with ID:', sessionId)
    console.log('Sessions: Session ID type:', typeof sessionId)
    console.log('Sessions: Session ID length:', sessionId?.length)
    console.log('Sessions: Is valid ObjectId format?', /^[0-9a-fA-F]{24}$/.test(sessionId))
    navigate(`/sessions/${sessionId}`)
  }

  const handleCreateSession = async (sessionData) => {
    try {
      console.log('Sessions: Creating session with data:', sessionData)
      const { createSession } = await import('@/api/sessions')
      const result = await createSession(sessionData)
      console.log('Sessions: Session creation result:', result)
      console.log('Sessions: New session ID:', result.session?._id)
      
      toast({
        title: "Success",
        description: "Session created successfully",
      })
      
      // Refresh sessions list
      const data = await getSessions()
      console.log('Sessions: Refreshed sessions after creation:', data.sessions)
      setSessions(data.sessions || [])
      setShowCreateDialog(false)
      
      // Navigate to the new session
      if (result.session?._id) {
        console.log('Sessions: Navigating to new session:', result.session._id)
        navigate(`/sessions/${result.session._id}`)
      }
    } catch (error) {
      console.error('Sessions: Error creating session:', error)
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      })
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.stakes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.gameType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Sessions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and track your poker sessions
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search sessions by venue, stakes, or game type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-slate-400 mb-4">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No sessions found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first poker session.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Session
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card
              key={session._id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50"
              onClick={() => handleSessionClick(session._id)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {session.venue}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {new Date(session.date || session.createdAt).toLocaleDateString()} • {session.stakes} • {session.gameType}
                    </CardDescription>
                  </div>
                  <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-400">Profit:</span>
                    <span className={`font-semibold ${
                      session.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {session.profit >= 0 ? '+' : ''}${session.profit?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {Math.floor((session.duration || 0) / 60)}h {(session.duration || 0) % 60}m
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-400">Hands:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {session.handsPlayed || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-400">Buy-in:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      ${session.buyIn?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                {session.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {session.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateSessionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateSession={handleCreateSession}
      />
    </div>
  )
}