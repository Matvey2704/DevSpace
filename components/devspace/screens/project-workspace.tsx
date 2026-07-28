'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { tasks as allTasks, type Project, type Task } from '@/lib/data'
import { ProgressBar, StatusBadge, Tag } from '../primitives'
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
  Settings2,
  TriangleAlert,
} from 'lucide-react'

const tabs = [
  'Overview',
  'Tasks',
  'Board',
  'Notes',
  'Analytics',
  'Activity',
] as const
type Tab = (typeof tabs)[number]

const weekData = [
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: 6 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 7 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 2 },
  { label: 'Sun', value: 4 },
]

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
  onBack,
  onToggleTask,
}: {
  project: Project
  onBack: () => void
  onToggleTask: (id: string) => void
}) {
  const [tab, setTab] = useState<Tab>('Overview')
  const projectTasks = allTasks.filter((t) => t.projectId === project.id)
  const inProgress = projectTasks.filter((t) => t.status === 'in-progress').length
  const overdue = 2
  const priorityTask = projectTasks.find((t) => t.priority === 'high') ?? projectTasks[0]

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
            Library
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
            <Button variant="outline" size="sm">
              <Pencil className="size-4" />
              Edit Project
            </Button>
            <Button variant="ghost" size="icon" aria-label="Project settings">
              <Settings2 className="size-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'relative shrink-0 px-3.5 py-2.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
              {tab === t && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8">
        {tab === 'Overview' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat
                  icon={CircleDot}
                  label="Progress"
                  value={`${project.progress}%`}
                  tint="bg-primary/15 text-primary"
                />
                <Stat
                  icon={CheckCircle2}
                  label="Completed"
                  value={`${project.tasksDone}`}
                  tint="bg-success/15 text-success"
                />
                <Stat
                  icon={Clock}
                  label="In Progress"
                  value={`${inProgress}`}
                  tint="bg-warning/15 text-warning"
                />
                <Stat
                  icon={TriangleAlert}
                  label="Overdue"
                  value={`${overdue}`}
                  tint="bg-destructive/15 text-destructive"
                />
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Weekly progress
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Tasks completed
                  </span>
                </div>
                <BarChart data={weekData} className="mt-5" />
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Recent activity
                </h3>
                <div className="mt-4 space-y-4">
                  {[
                    ['Completed', 'Set up CI pipeline', '2h ago'],
                    ['Moved to Review', 'Fix mobile navigation', '5h ago'],
                    ['Created', 'Configure RTK Query', 'Yesterday'],
                    ['Commented on', 'Implement authentication', '2 days ago'],
                  ].map(([action, item, time], i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                      <div className="flex-1 text-sm">
                        <span className="text-muted-foreground">{action} </span>
                        <span className="font-medium text-foreground">{item}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Overall progress
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold text-foreground">
                    {project.progress}
                  </span>
                  <span className="text-lg text-muted-foreground">%</span>
                </div>
                <ProgressBar value={project.progress} className="mt-3 h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {project.tasksDone} of {project.tasksTotal} tasks completed
                </p>
              </div>

              {priorityTask && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Priority task
                  </h3>
                  <div className="mt-3">
                    <TaskRow task={priorityTask} onToggle={onToggleTask} />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Upcoming deadlines
                </h3>
                <div className="mt-3 space-y-3">
                  {projectTasks
                    .filter((t) => t.deadline)
                    .slice(0, 3)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate text-foreground">{t.title}</span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {t.deadline}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'Tasks' && (
          <ProjectTasksView tasks={projectTasks} onToggle={onToggleTask} />
        )}

        {tab === 'Board' && <KanbanBoard tasks={projectTasks} />}

        {(tab === 'Notes' || tab === 'Analytics' || tab === 'Activity') && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-20 text-center">
            <p className="text-sm font-medium text-foreground">
              {tab} coming soon
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              This section of the {project.name} workspace is part of the design
              concept.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
