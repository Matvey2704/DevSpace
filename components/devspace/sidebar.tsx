'use client'

import { cn } from '@/lib/utils'
import {
  BarChart3,
  Calendar,
  CheckSquare,
  FolderKanban,
  Home,
  Layers,
  NotebookPen,
  Settings,
  Sun,
} from 'lucide-react'

export type NavKey =
  | 'home'
  | 'my-day'
  | 'all-tasks'
  | 'projects'
  | 'calendar'
  | 'analytics'
  | 'notes'
  | 'settings'

const items: { key: NavKey; label: string; icon: React.ElementType }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'my-day', label: 'My Day', icon: Sun },
  { key: 'all-tasks', label: 'All Tasks', icon: CheckSquare },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'notes', label: 'Notes', icon: NotebookPen },
  { key: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({
  active,
  onNavigate,
  className,
  onItemClick,
}: {
  active: NavKey
  onNavigate: (key: NavKey) => void
  className?: string
  onItemClick?: () => void
}) {
  return (
    <aside
      className={cn(
        'flex h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar',
        className,
      )}
    >
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="size-4" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold text-sidebar-foreground">
            DevSpace
          </span>
          <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            workspace
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {items.map((item) => {
          const isActive = active === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key)
                onItemClick?.()
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
              )}
            >
              <Icon
                className={cn('size-4', isActive && 'text-primary')}
                strokeWidth={2}
              />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-xl border border-sidebar-border bg-card/60 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Focus streak</span>
            <span className="font-mono text-xs text-primary">6 days</span>
          </div>
          <div className="mt-2.5 flex gap-1">
            {[1, 1, 1, 1, 1, 1, 0].map((v, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full',
                  v ? 'bg-primary' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
