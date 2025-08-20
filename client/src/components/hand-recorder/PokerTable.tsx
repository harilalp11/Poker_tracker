import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface PokerTableProps {
  selectedPosition: string
  onPositionSelect: (position: string) => void
  tableSize: string
}

const getPositionsForTableSize = (tableSize: string) => {
  const basePositions = {
    'heads-up': [
      { name: 'BTN', x: 75, y: 40, label: 'Button/Small Blind', shortDesc: 'Button Position' },
      { name: 'BB', x: 25, y: 40, label: 'Big Blind', shortDesc: 'Big Blind Position' }
    ],
    '2-max': [
      { name: 'BTN', x: 75, y: 40, label: 'Button/Small Blind', shortDesc: 'Button Position' },
      { name: 'BB', x: 25, y: 40, label: 'Big Blind', shortDesc: 'Big Blind Position' }
    ],
    '6-max': [
      { name: 'UTG', x: 50, y: 85, label: 'Under the Gun', shortDesc: 'Early Position' },
      { name: 'MP', x: 15, y: 50, label: 'Middle Position', shortDesc: 'Middle Position' },
      { name: 'CO', x: 50, y: 15, label: 'Cutoff', shortDesc: 'Late Position' },
      { name: 'BTN', x: 85, y: 50, label: 'Button', shortDesc: 'Dealer Position' },
      { name: 'SB', x: 75, y: 75, label: 'Small Blind', shortDesc: 'Small Blind Position' },
      { name: 'BB', x: 25, y: 75, label: 'Big Blind', shortDesc: 'Big Blind Position' }
    ],
    '8-max': [
      { name: 'UTG', x: 50, y: 85, label: 'Under the Gun', shortDesc: 'Early Position' },
      { name: 'UTG+1', x: 25, y: 75, label: 'Under the Gun +1', shortDesc: 'Early Position' },
      { name: 'UTG+2', x: 15, y: 60, label: 'Under the Gun +2', shortDesc: 'Early Position' },
      { name: 'MP', x: 15, y: 40, label: 'Middle Position', shortDesc: 'Middle Position' },
      { name: 'MP+1', x: 25, y: 25, label: 'Middle Position +1', shortDesc: 'Middle Position' },
      { name: 'HJ', x: 50, y: 15, label: 'Hijack', shortDesc: 'Late Position' },
      { name: 'CO', x: 75, y: 25, label: 'Cutoff', shortDesc: 'Late Position' },
      { name: 'BTN', x: 85, y: 40, label: 'Button', shortDesc: 'Dealer Position' },
      { name: 'SB', x: 85, y: 60, label: 'Small Blind', shortDesc: 'Small Blind Position' },
      { name: 'BB', x: 75, y: 75, label: 'Big Blind', shortDesc: 'Big Blind Position' }
    ],
    '9-max': [
      { name: 'UTG', x: 50, y: 85, label: 'Under the Gun', shortDesc: 'Early Position' },
      { name: 'UTG+1', x: 25, y: 75, label: 'Under the Gun +1', shortDesc: 'Early Position' },
      { name: 'UTG+2', x: 15, y: 65, label: 'Under the Gun +2', shortDesc: 'Early Position' },
      { name: 'UTG+3', x: 10, y: 50, label: 'Under the Gun +3', shortDesc: 'Early Position' },
      { name: 'MP', x: 15, y: 35, label: 'Middle Position', shortDesc: 'Middle Position' },
      { name: 'MP+1', x: 25, y: 25, label: 'Middle Position +1', shortDesc: 'Middle Position' },
      { name: 'HJ', x: 50, y: 15, label: 'Hijack', shortDesc: 'Late Position' },
      { name: 'CO', x: 75, y: 25, label: 'Cutoff', shortDesc: 'Late Position' },
      { name: 'BTN', x: 85, y: 35, label: 'Button', shortDesc: 'Dealer Position' },
      { name: 'SB', x: 85, y: 65, label: 'Small Blind', shortDesc: 'Small Blind Position' },
      { name: 'BB', x: 75, y: 75, label: 'Big Blind', shortDesc: 'Big Blind Position' }
    ]
  }

  return basePositions[tableSize] || basePositions['6-max']
}

const getPositionColor = (position: string) => {
  if (['UTG', 'UTG+1', 'UTG+2', 'UTG+3'].includes(position)) return 'from-red-400 to-red-600'
  if (['MP', 'MP+1'].includes(position)) return 'from-yellow-400 to-yellow-600'
  if (['HJ', 'CO', 'BTN'].includes(position)) return 'from-green-400 to-green-600'
  if (['SB', 'BB'].includes(position)) return 'from-blue-400 to-blue-600'
  return 'from-slate-400 to-slate-600'
}

export function PokerTable({ selectedPosition, onPositionSelect, tableSize }: PokerTableProps) {
  console.log('PokerTable: Rendering with tableSize:', tableSize)

  const positions = getPositionsForTableSize(tableSize)
  console.log('PokerTable: Available positions for', tableSize, ':', positions.map(p => p.name))

  const selectedPos = positions.find(p => p.name === selectedPosition)
  console.log('PokerTable: Selected position:', selectedPosition, 'Valid:', !!selectedPos)

  return (
    <div className="space-y-6">
      {/* Table size indicator */}
      <div className="text-center">
        <Badge variant="outline" className="mb-4">
          {tableSize} Table - {positions.length} Positions
        </Badge>
      </div>

      {/* Realistic 3D Poker Table */}
      <div className="relative w-full h-96 mx-auto max-w-4xl">
        <style jsx>{`
          .poker-table-3d {
            perspective: 1000px;
            transform-style: preserve-3d;
            filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.4));
          }

          .poker-table-rail {
            background: linear-gradient(145deg,
              #8B4513 0%,
              #A0522D 10%,
              #CD853F 20%,
              #D2691E 30%,
              #A0522D 40%,
              #8B4513 50%,
              #654321 60%,
              #8B4513 70%,
              #A0522D 80%,
              #CD853F 90%,
              #8B4513 100%
            );
            box-shadow:
              0 25px 50px rgba(0, 0, 0, 0.5),
              inset 0 3px 6px rgba(255, 255, 255, 0.2),
              inset 0 -3px 6px rgba(0, 0, 0, 0.3),
              inset 0 0 20px rgba(139, 69, 19, 0.3);
            border: 2px solid #654321;
            transform: rotateX(5deg);
          }

          .wood-grain-texture {
            background-image:
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 1px,
                rgba(0, 0, 0, 0.1) 1px,
                rgba(0, 0, 0, 0.1) 2px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 2px,
                rgba(139, 69, 19, 0.1) 2px,
                rgba(139, 69, 19, 0.1) 4px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 3px,
                rgba(0, 0, 0, 0.05) 3px,
                rgba(0, 0, 0, 0.05) 6px
              );
            mix-blend-mode: multiply;
          }

          .poker-table-inner-rail {
            background: linear-gradient(145deg,
              #654321 0%,
              #8B4513 25%,
              #A0522D 50%,
              #8B4513 75%,
              #654321 100%
            );
            box-shadow:
              inset 0 6px 12px rgba(0, 0, 0, 0.4),
              inset 0 -3px 6px rgba(255, 255, 255, 0.1),
              0 0 10px rgba(139, 69, 19, 0.2);
            border: 1px solid #5D4037;
          }

          .poker-table-felt {
            background: linear-gradient(135deg,
              #0F4C3A 0%,
              #1B5E20 15%,
              #2E7D32 30%,
              #388E3C 45%,
              #2E7D32 60%,
              #1B5E20 75%,
              #0F4C3A 100%
            );
            box-shadow:
              inset 0 8px 16px rgba(0, 0, 0, 0.5),
              inset 0 -2px 4px rgba(255, 255, 255, 0.05),
              inset 0 0 30px rgba(15, 76, 58, 0.3);
            border: 1px solid #1B5E20;
          }

          .felt-texture {
            background-image:
              radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.08) 1px, transparent 0),
              radial-gradient(circle at 1px 3px, rgba(0, 0, 0, 0.1) 0.5px, transparent 0);
            background-size: 12px 12px, 8px 8px;
            mix-blend-mode: overlay;
          }

          .shadow-inner-custom {
            box-shadow: 
              inset 0 0 25px rgba(0, 0, 0, 0.4),
              inset 0 0 50px rgba(15, 76, 58, 0.2);
          }

          .stitching-line {
            border: 1px dashed rgba(46, 125, 50, 0.4);
            border-width: 1px;
          }

          .rail-highlight {
            background: linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.25) 0%,
              rgba(255, 255, 255, 0.1) 20%,
              transparent 40%,
              transparent 60%,
              rgba(0, 0, 0, 0.1) 80%,
              rgba(0, 0, 0, 0.2) 100%
            );
            border-radius: inherit;
          }

          .community-cards-area {
            background: linear-gradient(135deg,
              #0F4C3A 0%,
              #1B5E20 50%,
              #0F4C3A 100%
            );
            box-shadow:
              0 12px 24px rgba(0, 0, 0, 0.4),
              inset 0 3px 6px rgba(0, 0, 0, 0.3),
              inset 0 -1px 2px rgba(255, 255, 255, 0.1);
            border: 2px solid #8B4513;
          }

          .poker-position-button {
            backdrop-filter: blur(6px);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }

          .poker-position-button:hover {
            transform: translate(-50%, -50%) scale(1.15) translateZ(10px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          }

          .table-edge-decoration {
            border: 1px solid rgba(139, 69, 19, 0.3);
          }

          .table-inner-decoration {
            border: 1px solid rgba(205, 133, 63, 0.2);
          }

          @keyframes premium-glow {
            0%, 100% { 
              box-shadow: 
                0 0 10px rgba(59, 130, 246, 0.4),
                0 4px 8px rgba(0, 0, 0, 0.2);
            }
            50% { 
              box-shadow: 
                0 0 20px rgba(59, 130, 246, 0.6),
                0 8px 16px rgba(0, 0, 0, 0.3);
            }
          }

          .poker-position-button:focus {
            animation: premium-glow 2s ease-in-out infinite;
          }

          .wood-polish {
            background: linear-gradient(
              45deg,
              transparent 30%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 70%
            );
            animation: wood-shine 4s ease-in-out infinite;
          }

          @keyframes wood-shine {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
        `}</style>

        <div className="relative w-full h-full poker-table-3d">
          {/* Outer wooden rail with realistic mahogany finish */}
          <div className="absolute inset-0 rounded-full poker-table-rail">
            {/* Wood grain texture overlay */}
            <div className="absolute inset-0 rounded-full wood-grain-texture"></div>
            
            {/* Wood polish shine effect */}
            <div className="absolute inset-0 rounded-full wood-polish"></div>

            {/* Inner bevel effect */}
            <div className="absolute inset-3 rounded-full poker-table-inner-rail">

              {/* Playing surface (premium felt) */}
              <div className="absolute inset-4 rounded-full poker-table-felt">
                {/* Felt texture overlay */}
                <div className="absolute inset-0 rounded-full felt-texture"></div>

                {/* Subtle inner shadow for depth */}
                <div className="absolute inset-0 rounded-full shadow-inner-custom"></div>

                {/* Stitching line where felt meets wood */}
                <div className="absolute inset-0 rounded-full stitching-line"></div>
              </div>
            </div>

            {/* Outer rail highlight for 3D effect */}
            <div className="absolute inset-0 rounded-full rail-highlight"></div>
          </div>

          {/* Center area for community cards */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-52 h-32">
            <div className="w-full h-full community-cards-area rounded-xl flex items-center justify-center">
              <div className="text-amber-200 text-sm font-bold text-center leading-tight">
                COMMUNITY CARDS<br />
                <span className="text-amber-300 text-xl">♠ ♥ ♦ ♣</span>
              </div>
            </div>
          </div>

          {/* Position buttons with enhanced 3D styling */}
          {positions.map((position) => {
            const isSelected = selectedPosition === position.name
            const colorGradient = getPositionColor(position.name)

            return (
              <Button
                key={position.name}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 poker-position-button ${
                  isSelected
                    ? `bg-gradient-to-r ${colorGradient} text-white shadow-2xl scale-125 z-20 border-2 border-white ring-4 ring-blue-400 ring-opacity-60`
                    : 'bg-gradient-to-br from-slate-50 to-white text-slate-900 border-2 border-slate-300 hover:border-blue-400 hover:shadow-xl z-10'
                }`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                onClick={() => {
                  console.log('PokerTable: Position clicked:', position.name)
                  onPositionSelect(position.name)
                }}
                title={`${position.label} - ${position.shortDesc}`}
              >
                <div className="flex flex-col items-center">
                  <span className="font-bold text-xs">{position.name}</span>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-1 animate-pulse shadow-sm"></div>
                  )}
                </div>
              </Button>
            )
          })}

          {/* Table edge decorative elements */}
          <div className="absolute inset-1 rounded-full table-edge-decoration pointer-events-none"></div>
          <div className="absolute inset-4 rounded-full table-inner-decoration pointer-events-none"></div>
        </div>
      </div>

      {/* Position information panel */}
      <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <CardContent className="p-4">
          {selectedPos ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                    {selectedPos.label}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedPos.shortDesc}
                  </p>
                </div>
                <Badge className={`bg-gradient-to-r ${getPositionColor(selectedPos.name)} text-white`}>
                  {selectedPos.name}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Position Type:</span>
                  <p className="text-slate-600 dark:text-slate-400">{selectedPos.shortDesc}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Playing Style:</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {['UTG', 'UTG+1', 'UTG+2', 'UTG+3'].includes(selectedPos.name) ? 'Tight' :
                     ['MP', 'MP+1'].includes(selectedPos.name) ? 'Balanced' :
                     ['HJ', 'CO', 'BTN'].includes(selectedPos.name) ? 'Aggressive' : 'Defensive'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Click on a seat to select your position
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {positions.map((pos) => (
                  <Badge key={pos.name} variant="outline" className="text-xs">
                    {pos.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick position selection - now dynamic */}
      <div className="grid grid-cols-1 gap-4">
        {/* Early Positions */}
        {positions.some(p => ['UTG', 'UTG+1', 'UTG+2', 'UTG+3'].includes(p.name)) && (
          <div className="text-center">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Early Position</p>
            <div className="flex gap-1 justify-center flex-wrap">
              {positions.filter(p => ['UTG', 'UTG+1', 'UTG+2', 'UTG+3'].includes(p.name)).map((pos) => (
                <Button
                  key={pos.name}
                  variant={selectedPosition === pos.name ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => onPositionSelect(pos.name)}
                >
                  {pos.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Middle Positions */}
        {positions.some(p => ['MP', 'MP+1'].includes(p.name)) && (
          <div className="text-center">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Middle Position</p>
            <div className="flex gap-1 justify-center flex-wrap">
              {positions.filter(p => ['MP', 'MP+1'].includes(p.name)).map((pos) => (
                <Button
                  key={pos.name}
                  variant={selectedPosition === pos.name ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => onPositionSelect(pos.name)}
                >
                  {pos.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Late Positions */}
        {positions.some(p => ['HJ', 'CO', 'BTN'].includes(p.name)) && (
          <div className="text-center">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Late Position</p>
            <div className="flex gap-1 justify-center flex-wrap">
              {positions.filter(p => ['HJ', 'CO', 'BTN'].includes(p.name)).map((pos) => (
                <Button
                  key={pos.name}
                  variant={selectedPosition === pos.name ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => onPositionSelect(pos.name)}
                >
                  {pos.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Blind Positions */}
        {positions.some(p => ['SB', 'BB'].includes(p.name)) && (
          <div className="text-center">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Blind Positions</p>
            <div className="flex gap-1 justify-center flex-wrap">
              {positions.filter(p => ['SB', 'BB'].includes(p.name)).map((pos) => (
                <Button
                  key={pos.name}
                  variant={selectedPosition === pos.name ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => onPositionSelect(pos.name)}
                >
                  {pos.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}