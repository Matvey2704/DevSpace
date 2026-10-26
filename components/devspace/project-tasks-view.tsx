'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import type { Task } from '@/lib/data'
import { applyTaskFilters, emptyFilters, type TaskFilters } from '@/lib/task-filters'
import { TaskRow } from './task-row'
import { KanbanBoard } from './kanban-board'
import { TaskFilterBar } from './task-filter-bar'
import type { TaskActions } from './task-actions'
import { Columns3, LayoutList, Plus, Rows3, Search } from 'lucide-react'

type View = 'list' | 'compact' | 'board'

export function ProjectTasksView({
  tasks,
  actions,
  projectId,
  showProject = false,
}: {
  tasks: Task[]
  actions: TaskActions
  projectId: string
  showProject?: boolean
}) {
  const { t } = useI18n()
  const [view, setView] = useState<View>('list')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters)

  const filtered = applyTaskFilters(tasks, filters, query)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold text-foreground">{t('tasks.title')}</h2>
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
              placeholder={t('tasks.search')}
              className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
            />
          </div>
          <Button size="sm" onClick={() => actions.onCreate({ projectId })}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">{t('tasks.create')}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskFilterBar tasks={tasks} filters={filters} onChange={setFilters} />
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(
            [
              { key: 'list', icon: LayoutList },
              { key: 'compact', icon: Rows3 },
              { key: 'board', icon: Columns3 },
            ] as const
          ).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              aria-label={t(`tasks.view.${v.key}`)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                view === v.key
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <v.icon className="size-3.5" />
              <span className="hidden sm:inline">{t(`tasks.view.${v.key}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {view === 'board' ? (
        <KanbanBoard
          tasks={filtered}
          actions={actions}
          projectId={projectId}
          showProject={showProject}
        />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            {tasks.length === 0 ? t('tasks.empty.title') : t('tasks.noMatch.title')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tasks.length === 0 ? t('tasks.empty.hint') : t('tasks.noMatch.hint')}
          </p>
          {tasks.length === 0 && (
            <Button size="sm" className="mt-4" onClick={() => actions.onCreate({ projectId })}>
              <Plus className="size-4" />
              {t('tasks.create')}
            </Button>
          )}
        </div>
      ) : (
        <div className={cn('space-y-2', view === 'compact' && 'space-y-1.5')}>
          {filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={actions.onToggle}
              onEdit={actions.onEdit}
              showProject={showProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
