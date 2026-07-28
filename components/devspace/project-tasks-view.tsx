'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/data'
import { TaskRow } from './task-row'
import { KanbanBoard } from './kanban-board'
import {
  Columns3,
  LayoutList,
  Plus,
  Rows3,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

type View = 'list' | 'compact' | 'board'

const filterChips = ['Status', 'Priority', 'Tags', 'Deadline', 'Assignee']

export function ProjectTasksView({
  tasks,
  onToggle,
  showProject = false,
}: {
  tasks: Task[]
  onToggle: (id: string) => void
  showProject?: boolean
}) {
  const [view, setView] = useState<View>('list')
  const [query, setQuery] = useState('')

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
            />
          </div>
          <Button size="sm">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Create Task</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="size-3.5" />
            Filters
          </span>
          {filterChips.map((c) => (
            <button
              key={c}
              className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(
            [
              { key: 'list', icon: LayoutList, label: 'List' },
              { key: 'compact', icon: Rows3, label: 'Compact' },
              { key: 'board', icon: Columns3, label: 'Board' },
            ] as const
          ).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              aria-label={v.label}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                view === v.key
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <v.icon className="size-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {view === 'board' ? (
        <KanbanBoard tasks={filtered} showProject={showProject} />
      ) : (
        <div className={cn('space-y-2', view === 'compact' && 'space-y-1.5')}>
          {filtered.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={onToggle}
              showProject={showProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
