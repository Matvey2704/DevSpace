'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import type { Project, Task } from '@/lib/data'
import { isOverdue, todayKey } from '@/lib/dates'
import {
  applyTaskFilters,
  emptyFilters,
  sortTasks,
  type TaskFilters,
  type TaskSort,
} from '@/lib/task-filters'
import { Button } from '@/components/ui/button'
import { TaskRow } from '../task-row'
import { FilterMenu } from '../filter-menu'
import { TaskFilterBar } from '../task-filter-bar'
import type { TaskActions } from '../task-actions'
import { Plus, Search } from 'lucide-react'

const sortKeys: TaskSort[] = ['deadline', 'priority', 'newest']

const groupDefs: { key: string; match: (t: Task, today: string) => boolean }[] = [
  { key: 'overdue', match: (t) => isOverdue(t) },
  { key: 'today', match: (t, today) => !t.done && t.deadline === today },
  {
    key: 'upcoming',
    match: (t, today) => !t.done && !!t.deadline && t.deadline > today,
  },
  { key: 'nodeadline', match: (t) => !t.done && t.deadline === null },
  { key: 'completed', match: (t) => t.done },
]

export function AllTasks({
  tasks,
  projects,
  actions,
}: {
  tasks: Task[]
  projects: Project[]
  actions: TaskActions
}) {
  const { t } = useI18n()
  const sortOptions = sortKeys.map((k) => ({ value: k, label: t(`allTasks.sort.${k}`) }))
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters)
  const [sort, setSort] = useState<TaskSort>('deadline')

  const inProject = tasks.filter((t) => projectFilter === 'all' || t.projectId === projectFilter)
  const filtered = sortTasks(applyTaskFilters(inProject, filters, query), sort)
  const today = todayKey()

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('allTasks.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('allTasks.subtitle')}
          </p>
        </div>
        <Button
          onClick={() =>
            actions.onCreate({ projectId: projectFilter === 'all' ? undefined : projectFilter })
          }
          disabled={projects.length === 0}
        >
          <Plus className="size-4" />
          {t('tasks.create')}
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('allTasks.search')}
            className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TaskFilterBar tasks={inProject} filters={filters} onChange={setFilters} />
          <FilterMenu
            label={t('allTasks.sort')}
            value={sort}
            options={sortOptions}
            onChange={(v) => setSort((v as TaskSort) ?? 'deadline')}
            clearLabel={null}
            align="right"
          />
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
          {t('allTasks.allProjects')}
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
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
            <p className="text-sm font-medium text-foreground">
              {tasks.length === 0 ? t('allTasks.empty.title') : t('allTasks.noMatch.title')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tasks.length === 0 ? t('allTasks.empty.hint') : t('allTasks.noMatch.hint')}
            </p>
          </div>
        )}
        {groupDefs.map((g) => {
          const groupTasks = filtered.filter((task) => g.match(task, today))
          if (groupTasks.length === 0) return null
          return (
            <section key={g.key}>
              <div className="mb-3 flex items-center gap-2">
                <h2
                  className={cn(
                    'text-sm font-semibold text-foreground',
                    g.key === 'overdue' && 'text-destructive',
                  )}
                >
                  {t(`allTasks.group.${g.key}`)}
                </h2>
                <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {groupTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {groupTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={actions.onToggle}
                    onEdit={actions.onEdit}
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
