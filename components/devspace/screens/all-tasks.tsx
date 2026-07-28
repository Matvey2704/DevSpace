'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { projects, type Task } from '@/lib/data'
import { TaskRow } from '../task-row'
import { ArrowUpDown, Search, SlidersHorizontal } from 'lucide-react'

const groupDefs: { key: string; label: string; match: (t: Task) => boolean }[] = [
  { key: 'today', label: 'Today', match: (t) => t.deadline === 'Today' && !t.done },
  {
    key: 'upcoming',
    label: 'Upcoming',
    match: (t) =>
      !t.done && !!t.deadline && !['Today'].includes(t.deadline) && t.deadline !== null,
  },
  { key: 'overdue', label: 'Overdue', match: (t) => false },
  { key: 'nodeadline', label: 'No Deadline', match: (t) => !t.done && t.deadline === null },
  { key: 'completed', label: 'Completed', match: (t) => t.done },
]

export function AllTasks({
  tasks,
  onToggleTask,
}: {
  tasks: Task[]
  onToggleTask: (id: string) => void
}) {
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const filtered = tasks.filter((t) => {
    const mp = projectFilter === 'all' || t.projectId === projectFilter
    const mq = t.title.toLowerCase().includes(query.toLowerCase())
    return mp && mq
  })

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          All Tasks
        </h1>
        <p className="text-sm text-muted-foreground">
          Every task across all your projects in one place.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all tasks…"
            className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="size-3.5" />
            Filters
          </span>
          {['Status', 'Priority', 'Deadline', 'Tag'].map((f) => (
            <button
              key={f}
              className="hidden rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {f}
            </button>
          ))}
          <Button variant="outline" size="sm">
            <ArrowUpDown className="size-3.5" />
            Sort
          </Button>
        </div>
      </div>

      {/* Project filter chips */}
      <div className="mt-4 flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1">
        <button
          onClick={() => setProjectFilter('all')}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            projectFilter === 'all'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          All projects
        </button>
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setProjectFilter(p.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              projectFilter === p.id
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="flex size-4 items-center justify-center rounded-[4px] bg-primary/20 text-[8px] font-bold text-primary">
              {p.name[0]}
            </span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Groups */}
      <div className="mt-6 space-y-6">
        {groupDefs.map((g) => {
          const groupTasks = filtered.filter(g.match)
          if (groupTasks.length === 0) return null
          return (
            <section key={g.key}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{g.label}</h2>
                <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {groupTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {groupTasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggle={onToggleTask}
                    showProject
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
