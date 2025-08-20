import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { 
  LayoutDashboard, 
  Clock, 
  BarChart3, 
  Users, 
  Settings,
  Spade,
  X
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Sessions', href: '/sessions', icon: Clock },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Players', href: '/players', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <div className="h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50">
      <div className="flex flex-col h-full">
        {/* Header with close button for mobile */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Spade className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PokerTracker
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Progability Gaming</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href))

            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose} // Close mobile menu when item is clicked
                className={cn(
                  "flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all duration-200 min-h-[44px] touch-manipulation", // 44px minimum touch target
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}