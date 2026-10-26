'use client'

import { cn } from '@/lib/utils'
import { taskStatusMeta, type Task } from '@/lib/data'
import { formatDeadline, isOverdue } from '@/lib/dates'
import { useI18n } from '@/lib/i18n'
import { PriorityBadge, Tag } from './primitives'
import { CalendarClock, Check, Clock } from 'lucide-react'

export function TaskRow({
  task,
  onToggle,
  onEdit,
  showProject = false,
}: {
  task: Task
  onToggle: (id: string) => void
  onEdit?: (task: Task) => void
  showProject?: boolean
}) {
  const { t, locale } = useI18n()
  const statusMeta = taskStatusMeta[task.status]
  const overdue = isOverdue(task)

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/30 hover:bg-card/80">
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? t('tasks.markUndone') : t('tasks.markDone')}
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          task.done
            ? 'border-success bg-success text-success-foreground'
            : 'border-border hover:border-primary',
        )}
      >
        {task.done && <Check className="size-3.5" strokeWidth={3} />}
      </button>

      <div
        className={cn('min-w-0 flex-1', onEdit && 'cursor-pointer')}
        onClick={() => onEdit?.(task)}
        role={onEdit ? 'button' : undefined}
        tabIndex={onEdit ? 0 : undefined}
        onKeyDown={(e) => {
          if (onEdit && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onEdit(task)
          }
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h4
            className={cn(
              'text-sm font-medium text-foreground',
              task.done && 'text-muted-foreground line-through',
            )}
          >
            {task.title}
          </h4>
          {showProject && task.projectName && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
              <span className="flex size-3.5 items-center justify-center rounded-[4px] bg-primary/20 text-[8px] font-bold text-primary">
                {task.projectName[0]}
              </span>
              {task.projectName}
            </span>
          )}
        </div>
        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn('size-1.5 rounded-full', statusMeta.dot)} />
            {t(`taskStatus.${task.status}`)}
          </span>
          {task.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {task.deadline && (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                overdue && 'font-medium text-destructive',
              )}
            >
              <CalendarClock className="size-3" />
              {formatDeadline(task.deadline, locale, t)}
            </span>
          )}
          {task.estimate && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {task.estimate}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
