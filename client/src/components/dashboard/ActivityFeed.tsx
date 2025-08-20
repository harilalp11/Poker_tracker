import { Badge } from '@/components/ui/badge'
import { Trophy, Target, TrendingUp, Star, Award } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'milestone',
    title: 'Reached 1000 hands!',
    description: 'Congratulations on this milestone',
    time: '2 hours ago',
    icon: Trophy,
    color: 'text-yellow-500'
  },
  {
    id: 2,
    type: 'achievement',
    title: 'Win Rate Improved',
    description: 'Your win rate increased to 62.3%',
    time: '1 day ago',
    icon: TrendingUp,
    color: 'text-green-500'
  },
  {
    id: 3,
    type: 'hand',
    title: 'Important Hand Marked',
    description: 'AA vs KK all-in pre-flop',
    time: '2 days ago',
    icon: Star,
    color: 'text-blue-500'
  },
  {
    id: 4,
    type: 'session',
    title: 'Best Session This Month',
    description: '+$350 in 3 hours at $2/$5',
    time: '3 days ago',
    icon: Award,
    color: 'text-purple-500'
  },
  {
    id: 5,
    type: 'goal',
    title: 'Monthly Goal Progress',
    description: '75% towards $2000 target',
    time: '1 week ago',
    icon: Target,
    color: 'text-orange-500'
  }
]

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${activity.color}`}>
            <activity.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {activity.title}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {activity.description}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}