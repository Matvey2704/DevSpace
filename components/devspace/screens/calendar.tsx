'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { projects } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const projectColors: Record<string, string> = {
  autohub: 'var(--info)',
  devspace: 'var(--primary)',
  portfolio: 'var(--warning)',
  learning: 'var(--success)',
}

// Deadline events keyed by day-of-month
const events: Record<number, { projectId: string; title: string; overdue?: boolean }[]> =
  {
    3: [{ projectId: 'learning', title: 'Optimize loading' }],
    9: [{ projectId: 'autohub', title: 'Fix mobile nav', overdue: true }],
    14: [
      { projectId: 'devspace', title: 'Auth' },
      { projectId: 'portfolio', title: 'Hero' },
    ],
    17: [{ projectId: 'autohub', title: 'RTK Query' }],
    22: [{ projectId: 'learning', title: 'WebSocket study' }],
    24: [{ projectId: 'devspace', title: 'Profile page' }],
  }

const views = ['Month', 'Week', 'Day'] as const

export function Calendar() {
  const [view, setView] = useState<(typeof views)[number]>('Month')
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  // March 2026 starts on a Sunday; offset so Mon-first grid has 6 leading blanks
  const firstOffset = 6
  const daysInMonth = 31
  const cells = [
    ...Array(firstOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Calendar
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Deadlines and tasks across all projects.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-32 text-center text-sm font-medium text-foreground">
              March 2026
            </span>
            <Button variant="outline" size="icon-sm" aria-label="Next month">
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {views.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  view === v
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {projects.map((p) => (
          <span key={p.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: projectColors[p.id] }}
            />
            {p.name}
          </span>
        ))}
      </div>

      {/* Month grid */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-7 border-b border-border">
          {weekdays.map((d) => (
            <div
              key={d}
              className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => (
            <div
              key={i}
              className={cn(
                'min-h-24 border-r border-b border-border p-1.5 last:border-r-0 md:min-h-28',
                day === 14 && 'bg-primary/5',
              )}
            >
              {day && (
                <>
                  <span
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-md text-xs',
                      day === 14
                        ? 'bg-primary font-semibold text-primary-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {events[day]?.map((e, j) => (
                      <div
                        key={j}
                        className={cn(
                          'flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[10px]',
                          e.overdue
                            ? 'bg-destructive/12 text-destructive'
                            : 'bg-secondary/70 text-foreground',
                        )}
                      >
                        <span
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: projectColors[e.projectId] }}
                        />
                        <span className="truncate">{e.title}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
