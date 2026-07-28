'use client'

import { cn } from '@/lib/utils'
import { projectById, taskStatusMeta, type Task } from '@/lib/data'
import { PriorityBadge, Tag } from './primitives'
import { CalendarClock, Check, Clock } from 'lucide-react'

export function TaskRow({
  task,
  onToggle,
  showProject = false,
}: {
  task: Task
  onToggle: (id: string) => void
  showProject?: boolean
}) {
  const project = projectById(task.projectId)
  const statusMeta = taskStatusMeta[task.status]

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/30 hover:bg-card/80">
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          task.done
            ? 'border-success bg-success text-success-foreground'
            : 'border-border hover:border-primary',
        )}
      >
        {task.done && <Check className="size-3.5" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4
            className={cn(
              'text-sm font-medium text-foreground',
              task.done && 'text-muted-foreground line-through',
            )}
          >
            {task.title}
          </h4>
          {showProject && project && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
              <span className="flex size-3.5 items-center justify-center rounded-[4px] bg-primary/20 text-[8px] font-bold text-primary">
                {project.name[0]}
              </span>
              {project.name}
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {task.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn('size-1.5 rounded-full', statusMeta.dot)} />
            {statusMeta.label}
          </span>
          {task.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {task.deadline && (
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3" />
              {task.deadline}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {task.estimate}
          </span>
        </div>
      </div>
    </div>
  )
}
