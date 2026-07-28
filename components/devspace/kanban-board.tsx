'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  projectById,
  taskStatusMeta,
  type Task,
  type TaskStatus,
} from '@/lib/data'
import { PriorityBadge } from './primitives'
import { CalendarClock, Clock, GripVertical, Plus } from 'lucide-react'

const columns: TaskStatus[] = [
  'ideas',
  'planned',
  'in-progress',
  'review',
  'completed',
]

function KanbanCard({
  task,
  showProject,
  onDragStart,
}: {
  task: Task
  showProject: boolean
  onDragStart: (id: string) => void
}) {
  const project = projectById(task.projectId)
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task.id)}
      className="group cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
        <GripVertical className="size-4 shrink-0 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.tags.slice(0, 2).map((t) => (
          <span
            key={t}
            className="rounded-md border border-border bg-secondary/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2.5">
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
        {showProject && project && (
          <span className="flex size-4 items-center justify-center rounded-[4px] bg-primary/20 text-[8px] font-bold text-primary">
            {project.name[0]}
          </span>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({
  tasks,
  showProject = false,
}: {
  tasks: Task[]
  showProject?: boolean
}) {
  const [items, setItems] = useState(tasks)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overCol, setOverCol] = useState<TaskStatus | null>(null)

  function handleDrop(col: TaskStatus) {
    if (!dragId) return
    setItems((prev) =>
      prev.map((t) => (t.id === dragId ? { ...t, status: col } : t)),
    )
    setDragId(null)
    setOverCol(null)
  }

  return (
    <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colTasks = items.filter((t) => t.status === col)
        const meta = taskStatusMeta[col]
        return (
          <div
            key={col}
            onDragOver={(e) => {
              e.preventDefault()
              setOverCol(col)
            }}
            onDrop={() => handleDrop(col)}
            className={cn(
              'flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-card/40 transition-colors',
              overCol === col && 'border-primary/50 bg-primary/5',
            )}
          >
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="flex items-center gap-2">
                <span className={cn('size-2 rounded-full', meta.dot)} />
                <span className="text-sm font-medium text-foreground">
                  {meta.label}
                </span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <button
                aria-label="Add task"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 px-2.5 pb-3">
              {colTasks.map((t) => (
                <KanbanCard
                  key={t.id}
                  task={t}
                  showProject={showProject}
                  onDragStart={setDragId}
                />
              ))}
              {colTasks.length === 0 && (
                <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                  Drop here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
