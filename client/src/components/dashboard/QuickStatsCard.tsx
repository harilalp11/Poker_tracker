import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface QuickStatsCardProps {
  title: string
  value: string
  trend?: string
  trendDirection?: 'up' | 'down'
  icon: React.ElementType
}

export function QuickStatsCard({ title, value, trend, trendDirection, icon: Icon }: QuickStatsCardProps) {
  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
              {title}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
              {value}
            </p>
            {trend && (
              <div className={`flex items-center mt-2 text-xs sm:text-sm ${
                trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendDirection === 'up' ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                )}
                <span className="truncate">{trend}</span>
              </div>
            )}
          </div>
          <div className="ml-3 sm:ml-4 flex-shrink-0">
            <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}