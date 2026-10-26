'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project, Task } from '@/lib/data'
import { formatDeadline, isOverdue } from '@/lib/dates'
import { intlLocale, useI18n } from '@/lib/i18n'
import { currentWeekByDay } from '@/lib/stats'
import { ProgressBar, StatusBadge, Tag } from '../primitives'
import type { TaskActions } from '../task-actions'
import { ProjectTasksView } from '../project-tasks-view'
import { KanbanBoard } from '../kanban-board'
import { BarChart } from '../charts'
import { TaskRow } from '../task-row'
import {
  ArrowLeft,
  CheckCircle2,
  CircleDot,
  Clock,
  Pencil,
  TriangleAlert,
} from 'lucide-react'

const tabs = ['overview', 'tasks', 'board', 'notes', 'analytics', 'activity'] as const
type Tab = (typeof tabs)[number]

function Stat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ElementType
  label: string
  value: string
  tint: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-lg',
            tint,
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function ProjectWorkspace({
  project,
  tasks,
  actions,
  onBack,
  onEditProject,
}: {
  project: Project
  /** Задачи этого проекта */
  tasks: Task[]
  actions: TaskActions
  onBack: () => void
  onEditProject: (project: Project) => void
}) {
  const { t, locale } = useI18n()
  const [tab, setTab] = useState<Tab>('overview')

  const projectTasks = tasks
  const inProgress = projectTasks.filter((t) => t.status === 'in-progress').length
  const overdue = projectTasks.filter(isOverdue).length
  const weekData = currentWeekByDay(projectTasks, locale)
  const upcoming = projectTasks
    .filter((t) => !t.done && t.deadline)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .slice(0, 3)
  const recentDone = projectTasks
    .filter((t) => t.done && t.completedAt)
    .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
    .slice(0, 5)
  const rank = { high: 0, medium: 1, low: 2 } as const
  const priorityTask = projectTasks
    .filter((t) => !t.done)
    .sort((a, b) => rank[a.priority] - rank[b.priority])[0]

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden md:h-64">
        <img
          src={project.cover || '/placeholder.svg'}
          alt=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="absolute top-4 left-4">
          <Button variant="outline" size="sm" onClick={onBack} className="backdrop-blur-md">
            <ArrowLeft className="size-4" />
            {t('project.back')}
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <span className="-mt-12 flex size-20 items-center justify-center rounded-2xl border border-border bg-card text-2xl font-semibold text-foreground shadow-lg">
          {project.name
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')}
        </span>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {project.description}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEditProject(project)}>
              <Pencil className="size-4" />
              {t('project.edit')}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={cn(
                'relative shrink-0 px-3.5 py-2.5 text-sm font-medium transition-colors',
                tab === tabKey
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(`project.tab.${tabKey}`)}
              {tab === tabKey && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  icon={CircleDot}
                  label={t('project.stat.progress')}
                  value={`${project.progress}%`}
                  tint="bg-primary/15 text-primary"
                />
                <Stat
                  icon={CheckCircle2}
                  label={t('project.stat.completed')}
                  value={`${project.tasksDone}`}
                  tint="bg-success/15 text-success"
                />
                <Stat
                  icon={Clock}
                  label={t('project.stat.inProgress')}
                  value={`${inProgress}`}
                  tint="bg-warning/15 text-warning"
                />
                <Stat
                  icon={TriangleAlert}
                  label={t('project.stat.overdue')}
                  value={`${overdue}`}
                  tint="bg-destructive/15 text-destructive"
                />
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t('project.weekly')}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {t('project.weekly.sub')}
                  </span>
                </div>
                <BarChart data={weekData} className="mt-5" />
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('project.recent')}
                </h3>
                {recentDone.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t('project.recent.empty')}
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {recentDone.map((task) => (
                      <li key={task.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <CheckCircle2 className="size-4 shrink-0 text-success" />
                          <span className="truncate text-foreground">{task.title}</span>
                        </span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {new Date(task.completedAt!).toLocaleDateString(intlLocale(locale), {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('project.overall')}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-foreground">
                    {project.progress}
                  </span>
                  <span className="text-lg text-muted-foreground">%</span>
                </div>
                <ProgressBar value={project.progress} className="mt-3 h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {t('project.ofTasks', { done: project.tasksDone, total: project.tasksTotal })}
                </p>
              </div>

              {priorityTask && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t('project.priorityTask')}
                  </h3>
                  <div className="mt-3">
                    <TaskRow
                      task={priorityTask}
                      onToggle={actions.onToggle}
                      onEdit={actions.onEdit}
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('project.upcoming')}
                </h3>
                <div className="mt-3 space-y-3">
                  {upcoming.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {projectTasks.length === 0 ? t('project.noTasks') : t('project.noUpcoming')}
                    </p>
                  )}
                  {upcoming.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-foreground">{task.title}</span>
                      <span
                        className={cn(
                          'shrink-0 font-mono text-xs text-muted-foreground',
                          isOverdue(task) && 'text-destructive',
                        )}
                      >
                        {formatDeadline(task.deadline!, locale, t)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <ProjectTasksView tasks={projectTasks} actions={actions} projectId={project.id} />
        )}

        {tab === 'board' && (
          <KanbanBoard tasks={projectTasks} actions={actions} projectId={project.id} />
        )}

        {(tab === 'notes' || tab === 'analytics' || tab === 'activity') && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
            <p className="text-sm font-medium text-foreground">
              {t('project.soon.title')}
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t('project.soon.body', { tab: t(`project.tab.${tab}`), name: project.name })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}