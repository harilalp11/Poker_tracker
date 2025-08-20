import { Badge } from '@/components/ui/badge'

interface PositionHeatmapProps {
  data: Array<{
    position: string
    hands: number
    profit: number
    vpip: number
    pfr: number
  }>
}

export function PositionHeatmap({ data }: PositionHeatmapProps) {
  const getColorIntensity = (profit: number, maxProfit: number, minProfit: number) => {
    const range = maxProfit - minProfit
    if (range === 0) return 'bg-slate-100'
    
    const normalized = (profit - minProfit) / range
    if (profit > 0) {
      const intensity = Math.min(normalized * 100, 100)
      return `bg-green-${Math.ceil(intensity / 20) * 100} bg-opacity-${Math.max(20, Math.ceil(intensity / 10) * 10)}`
    } else {
      const intensity = Math.min(Math.abs(normalized) * 100, 100)
      return `bg-red-${Math.ceil(intensity / 20) * 100} bg-opacity-${Math.max(20, Math.ceil(intensity / 10) * 10)}`
    }
  }

  const maxProfit = Math.max(...data.map(d => d.profit))
  const minProfit = Math.min(...data.map(d => d.profit))

  return (
    <div className="space-y-6">
      {/* Position Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {data.map((position) => (
          <div
            key={position.position}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              position.profit >= 0 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
            }`}
          >
            <div className="text-center">
              <div className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                {position.position}
              </div>
              <div className={`text-xl font-bold mb-2 ${
                position.profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${position.profit.toFixed(2)}
              </div>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <div>{position.hands} hands</div>
                <div className="flex justify-between">
                  <span>VPIP:</span>
                  <Badge variant="outline" className="text-xs">
                    {position.vpip}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>PFR:</span>
                  <Badge variant="outline" className="text-xs">
                    {position.pfr}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span>Profitable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 rounded"></div>
          <span>Losing</span>
        </div>
      </div>
    </div>
  )
}