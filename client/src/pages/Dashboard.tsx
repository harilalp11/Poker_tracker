import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuickStatsCard } from '@/components/dashboard/QuickStatsCard'
import { RecentSessionsList } from '@/components/dashboard/RecentSessionsList'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { getAnalytics } from '@/api/analytics'
import { getSessions } from '@/api/sessions'
import { useToast } from '@/hooks/useToast'
import {
  DollarSign,
  TrendingUp,
  Clock,
  Target,
  Plus,
  BarChart3,
  Users,
  Settings
} from 'lucide-react'

export function Dashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [analytics, setAnalytics] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, sessionsData] = await Promise.all([
          getAnalytics(),
          getSessions()
        ])
        setAnalytics(analyticsData.analytics)
        setSessions(sessionsData.sessions)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 sm:p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 sm:h-8 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <QuickStatsCard
          title="Total Profit"
          value={`$${analytics?.overview?.totalProfit?.toFixed(2) || '0.00'}`}
          trend="+12.5%"
          trendDirection="up"
          icon={DollarSign}
        />
        <QuickStatsCard
          title="Win Rate"
          value={`${analytics?.overview?.winRate || 0}%`}
          trend="+2.1%"
          trendDirection="up"
          icon={Target}
        />
        <QuickStatsCard
          title="Total Hands"
          value={analytics?.overview?.totalHands?.toLocaleString() || '0'}
          trend="+145"
          trendDirection="up"
          icon={TrendingUp}
        />
        <QuickStatsCard
          title="Hourly Rate"
          value={`$${analytics?.overview?.hourlyRate?.toFixed(2) || '0.00'}/hr`}
          trend="+$3.20"
          trendDirection="up"
          icon={Clock}
        />
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          <CardDescription className="text-sm">
            Get started with your poker tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button 
              onClick={() => navigate('/sessions')} 
              className="h-12 sm:h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium min-h-[44px]"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              New Session
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/analytics')}
              className="h-12 sm:h-14 font-medium min-h-[44px]"
            >
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/players')}
              className="h-12 sm:h-14 font-medium min-h-[44px]"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Manage Players
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
              className="h-12 sm:h-14 font-medium min-h-[44px]"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Sessions */}
        <div className="lg:col-span-2">
          <RecentSessionsList sessions={sessions.slice(0, 5)} />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}