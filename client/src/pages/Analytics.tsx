import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAnalytics, AnalyticsData } from '@/api/analytics'
import { useToast } from '@/hooks/useToast'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  Filter,
  Download
} from 'lucide-react'
import { PerformanceChart } from '@/components/analytics/PerformanceChart'
import { PositionHeatmap } from '@/components/analytics/PositionHeatmap'
import { StatsCard } from '@/components/analytics/StatsCard'

export function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        console.log('Loading analytics data...')
        const data = await getAnalytics()
        setAnalytics(data.analytics)
      } catch (error) {
        console.error('Error loading analytics:', error)
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  if (!analytics) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive analysis of your poker performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Profit"
          value={`$${analytics.overview.totalProfit.toFixed(2)}`}
          change={analytics.overview.totalProfit > 0 ? '+12.5%' : '-5.2%'}
          trend={analytics.overview.totalProfit > 0 ? 'up' : 'down'}
          icon={DollarSign}
        />
        <StatsCard
          title="Win Rate"
          value={`${analytics.overview.winRate}%`}
          change="+2.1%"
          trend="up"
          icon={Target}
        />
        <StatsCard
          title="Total Hands"
          value={analytics.overview.totalHands.toLocaleString()}
          change="+145"
          trend="up"
          icon={BarChart3}
        />
        <StatsCard
          title="Hourly Rate"
          value={`$${analytics.overview.hourlyRate}/hr`}
          change="+$3.20"
          trend="up"
          icon={Clock}
        />
      </div>

      {/* Performance Chart */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
          <CardDescription>Your profit and hands played over time</CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceChart data={analytics.performanceChart} />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pre-flop Stats */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>Pre-flop Statistics</CardTitle>
            <CardDescription>Your pre-flop playing tendencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.preflopStats.vpip}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">VPIP</div>
                <Badge variant="secondary" className="mt-1">
                  {analytics.preflopStats.vpip > 25 ? 'Loose' : analytics.preflopStats.vpip < 20 ? 'Tight' : 'Balanced'}
                </Badge>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.preflopStats.pfr}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">PFR</div>
                <Badge variant="secondary" className="mt-1">
                  {analytics.preflopStats.pfr > 20 ? 'Aggressive' : analytics.preflopStats.pfr < 15 ? 'Passive' : 'Balanced'}
                </Badge>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.preflopStats.threeBet}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">3-Bet</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.preflopStats.stealAttempts}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Steal Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Post-flop Stats */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle>Post-flop Statistics</CardTitle>
            <CardDescription>Your post-flop playing patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.postflopStats.cBetFlop}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">C-Bet Flop</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.postflopStats.cBetTurn}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">C-Bet Turn</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.postflopStats.aggressionFactor}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Aggression Factor</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {analytics.postflopStats.wtsd}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">WTSD</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Analysis */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Position Analysis</CardTitle>
          <CardDescription>Performance breakdown by table position</CardDescription>
        </CardHeader>
        <CardContent>
          <PositionHeatmap data={analytics.positionStats} />
        </CardContent>
      </Card>
    </div>
  )
}