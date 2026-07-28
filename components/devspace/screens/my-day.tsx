'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { tasks as allTasks, type Priority, type Task } from '@/lib/data'
import { ProgressBar } from '../primitives'
import { TaskRow } from '../task-row'
import { Pause, Play, Plus, SkipForward, Timer } from 'lucide-react'

const groups: { key: Priority; label: string; taskIds: string[] }[] = [
  { key: 'high', label: 'High Priority', taskIds: ['t3', 't1'] },
  { key: 'medium', label: 'Medium Priority', taskIds: ['t6', 't8'] },
]

function pick(ids: string[]): Task[] {
  return ids.map((id) => allTasks.find((t) => t.id === id)!).filter(Boolean)
}

export function MyDay({ onToggleTask }: { onToggleTask: (id: string) => void }) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const done = 3
  const total = 7

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {today}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Good morning, Alex
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You have {total - done} tasks left across 3 projects today.
          </p>
        </div>
        <Button>
          <Plus className="size-4" />
          Add to My Day
        </Button>
      </div>

      {/* Daily summary */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="grid grid-cols-3 gap-3 lg:col-span-2">
          {[
            { label: 'Tasks done', value: `${done}/${total}` },
            { label: 'Est. work time', value: '5h 30m' },
            { label: 'Time logged', value: '2h 10m' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">
                {s.value}
              </p>
            </div>
          ))}
          <div className="col-span-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Daily progress</span>
              <span className="font-mono font-medium text-foreground">
                {Math.round((done / total) * 100)}%
              </span>
            </div>
            <ProgressBar value={(done / total) * 100} className="mt-3 h-2" />
          </div>
        </div>

        {/* Focus mode */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-primary uppercase">
            <Timer className="size-4" />
            Focus Mode
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Current task</p>
          <h3 className="mt-0.5 text-lg font-semibold text-foreground">
            Fix mobile navigation
          </h3>
          <p className="text-xs text-muted-foreground">AutoHub</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-4xl font-semibold text-foreground tabular-nums">
              24:18
            </span>
            <span className="text-xs text-muted-foreground">/ 45:00</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button size="sm">
              <Pause className="size-4" />
              Pause
            </Button>
            <Button variant="outline" size="sm">
              <SkipForward className="size-4" />
              Next
            </Button>
          </div>
          <div className="mt-4 border-t border-primary/20 pt-3 text-xs">
            <span className="text-muted-foreground">Up next · </span>
            <span className="font-medium text-foreground">
              Configure authentication — DevSpace
            </span>
          </div>
        </div>
      </div>

      {/* Grouped tasks */}
      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <section key={g.key}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={cn(
                  'size-2 rounded-full',
                  g.key === 'high' ? 'bg-destructive' : 'bg-warning',
                )}
              />
              <h2 className="text-sm font-semibold text-foreground">{g.label}</h2>
              <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {g.taskIds.length}
              </span>
            </div>
            <div className="space-y-2">
              {pick(g.taskIds).map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={onToggleTask}
                  showProject
                />
              ))}
            </div>
          </section>
        ))}

        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          <Plus className="size-4" />
          Quick add task to My Day
        </button>
      </div>
    </div>
  )
}
