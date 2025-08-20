import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Clock, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { Session } from '@/api/sessions'

interface RecentSessionsListProps {
  sessions: Session[]
}

export function RecentSessionsList({ sessions }: RecentSessionsListProps) {
  const navigate = useNavigate()

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No sessions yet. Start your first session to begin tracking!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session._id}
          className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={() => navigate(`/sessions/${session._id}`)}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  {session.venue} - {session.stakes}
                </h4>
                <Badge
                  variant={session.status === 'active' ? 'default' : 'secondary'}
                  className={session.status === 'active' ? 'bg-green-500' : ''}
                >
                  {session.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span>{session.date}</span>
                <span>{session.handsPlayed} hands</span>
                <span>{Math.floor(session.duration / 60)}h {session.duration % 60}m</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 font-semibold ${
              session.profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {session.profit >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              ${Math.abs(session.profit).toFixed(2)}
            </div>
            <div className="text-sm text-slate-500">
              VPIP: {session.vpip}% | PFR: {session.pfr}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}