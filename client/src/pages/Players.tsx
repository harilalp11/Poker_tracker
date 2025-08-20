import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getPlayers, addPlayer, deletePlayer, Player } from '@/api/players'
import { useToast } from '@/hooks/useToast'
import {
  Plus,
  Search,
  Filter,
  Users,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { AddPlayerDialog } from '@/components/players/AddPlayerDialog'
import { PlayerCard } from '@/components/players/PlayerCard'

export function Players() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        console.log('Loading players...')
        const data = await getPlayers()
        setPlayers(data.players)
      } catch (error) {
        console.error('Error loading players:', error)
        toast({
          title: "Error",
          description: "Failed to load players",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [toast])

  const handleAddPlayer = async (playerData: Partial<Player>) => {
    try {
      console.log('Adding new player:', playerData)
      const data = await addPlayer(playerData)
      setPlayers(prev => [data.player, ...prev])
      setShowAddDialog(false)
      toast({
        title: "Success",
        description: "Player added successfully",
      })
    } catch (error) {
      console.error('Error adding player:', error)
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive",
      })
    }
  }

  const handleDeletePlayer = async (id: string) => {
    try {
      console.log(`Deleting player ${id}`)
      await deletePlayer(id)
      setPlayers(prev => prev.filter(p => p._id !== id))
      toast({
        title: "Success",
        description: "Player deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting player:', error)
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive",
      })
    }
  }

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (player.alias && player.alias.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => player.tags.includes(tag))
    
    return matchesSearch && matchesTags
  })

  const allTags = Array.from(new Set(players.flatMap(p => p.tags)))

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Players
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your player database with notes and statistics
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search players by name or alias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Tag filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mr-2">Filter by tags:</span>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    selectedTags.includes(tag) 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="h-6 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players Grid */}
      <div className="grid gap-4">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player._id}
            player={player}
            onDelete={handleDeletePlayer}
          />
        ))}
      </div>

      {filteredPlayers.length === 0 && !loading && (
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No players found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm || selectedTags.length > 0 
                ? 'Try adjusting your search or filters' 
                : 'Start building your player database by adding your first player'
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add First Player
            </Button>
          </CardContent>
        </Card>
      )}

      <AddPlayerDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddPlayer={handleAddPlayer}
      />
    </div>
  )
}