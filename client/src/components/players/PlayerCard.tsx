import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Player } from '@/api/players'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface PlayerCardProps {
  player: Player
  onDelete: (id: string) => void
}

export function PlayerCard({ player, onDelete }: PlayerCardProps) {
  const getPlayingStyleColor = (style: string) => {
    switch (style) {
      case 'tight':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'loose':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'aggressive':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'passive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
    }
  }

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {player.name}
                </h3>
                {player.alias && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    "{player.alias}"
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                  player.profitAgainst >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {player.profitAgainst >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  ${Math.abs(player.profitAgainst).toFixed(2)}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Profit Against</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {player.winRateAgainst}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Win Rate</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {player.handsPlayed}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Hands Played</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {player.tags.map((tag, index) => (
                <Badge key={index} className={getPlayingStyleColor(tag.toLowerCase())}>
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {player.venue}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Last seen: {new Date(player.lastSeen).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-slate-400">VPIP:</span>
                <span className="ml-1 font-medium">{player.playingStyle.vpip}%</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">PFR:</span>
                <span className="ml-1 font-medium">{player.playingStyle.pfr}%</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400">Aggression:</span>
                <span className="ml-1 font-medium">{player.playingStyle.aggression}</span>
              </div>
            </div>

            {player.notes && (
              <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                  {player.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(player._id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}