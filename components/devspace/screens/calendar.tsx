'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Project, Task } from '@/lib/data'
import { addDays, fromDateKey, isOverdue, startOfWeekKey, toDateKey, todayKey } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { intlLocale, useI18n } from '@/lib/i18n'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Цвета проектов выдаём по кругу из палитры темы
const palette = ['var(--info)', 'var(--primary)', 'var(--warning)', 'var(--success)', 'var(--destructive)']

const views = ['month', 'week', 'day'] as const
type View = (typeof views)[number]

export function Calendar({
  tasks,
  projects,
  onEdit,
}: {
  tasks: Task[]
  projects: Project[]
  onEdit: (task: Task) => void
}) {
  const { t, locale } = useI18n()
  const [view, setView] = useState<View>('month')
  const [focus, setFocus] = useState(todayKey())
  const today = todayKey()

  // Подписи дней недели (Пн..Вс) на текущем языке
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    fromDateKey(addDays(startOfWeekKey(today), i)).toLocaleDateString(intlLocale(locale), {
      weekday: 'short',
    }),
  )

  const colorOf = useMemo(() => {
    const map = new Map(projects.map((p, i) => [p.id, palette[i % palette.length]]))
    return (id: string) => map.get(id) ?? palette[0]
  }, [projects])

  // дедлайн -> задачи
  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of tasks) {
      if (!t.deadline) continue
      const list = map.get(t.deadline) ?? []
      list.push(t)
      map.set(t.deadline, list)
    }
    return map
  }, [tasks])

  const noDeadline = tasks.filter((t) => !t.deadline && !t.done).length

  function shift(dir: 1 | -1) {
    const d = fromDateKey(focus)
    if (view === 'month') {
      d.setDate(1)
      d.setMonth(d.getMonth() + dir)
      setFocus(toDateKey(d))
    } else {
      setFocus(addDays(focus, dir * (view === 'week' ? 7 : 1)))
    }
  }

  const focusDate = fromDateKey(focus)
  const title =
    view === 'day'
      ? focusDate.toLocaleDateString(intlLocale(locale), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : view === 'week'
        ? (() => {
            const start = fromDateKey(startOfWeekKey(focus))
            const end = fromDateKey(addDays(startOfWeekKey(focus), 6))
            const f = (d: Date) => d.toLocaleDateString(intlLocale(locale), { month: 'short', day: 'numeric' })
            return `${f(start)} – ${f(end)}, ${end.getFullYear()}`
          })()
        : focusDate.toLocaleDateString(intlLocale(locale), { month: 'long', year: 'numeric' })

  // Ячейки месяца (Пн-первый): пустые до 1-го числа + дни
  const monthCells = useMemo(() => {
    const first = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1)
    const offset = (first.getDay() + 6) % 7
    const daysInMonth = new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, 0).getDate()
    return [
      ...Array<string | null>(offset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) =>
        toDateKey(new Date(first.getFullYear(), first.getMonth(), i + 1)),
      ),
    ]
  }, [focusDate])

  function Chip({ task }: { task: Task }) {
    return (
      <button
        onClick={() => onEdit(task)}
        title={`${task.title} — ${task.projectName}`}
        className={cn(
          'flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[10px] transition-colors hover:bg-secondary',
          isOverdue(task) ? 'bg-destructive/12 text-destructive' : 'bg-secondary/70 text-foreground',
          task.done && 'opacity-60 line-through',
        )}
      >
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: colorOf(task.projectId) }}
        />
        <span className="truncate">{task.title}</span>
      </button>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('calendar.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('calendar.subtitle')}
            {noDeadline > 0 && ` ${t('calendar.noDeadline', { count: noDeadline })}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setFocus(today)}>
            {t('calendar.today')}
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" aria-label={t('calendar.prev')} onClick={() => shift(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-40 text-center text-sm font-medium text-foreground">{title}</span>
            <Button variant="outline" size="icon-sm" aria-label={t('calendar.next')} onClick={() => shift(1)}>
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
                {t(`calendar.view.${v}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {projects.map((p) => (
          <span key={p.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: colorOf(p.id) }} />
            {p.name}
          </span>
        ))}
      </div>

      {view === 'month' && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-7 border-b border-border">
            {weekdays.map((d) => (
              <div key={d} className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthCells.map((key, i) => {
              const dayTasks = key ? (byDay.get(key) ?? []) : []
              const isToday = key === today
              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-24 border-r border-b border-border p-1.5 md:min-h-28',
                    (i + 1) % 7 === 0 && 'border-r-0',
                    isToday && 'bg-primary/5',
                  )}
                >
                  {key && (
                    <>
                      <button
                        onClick={() => {
                          setFocus(key)
                          setView('day')
                        }}
                        className={cn(
                          'inline-flex size-6 items-center justify-center rounded-md text-xs hover:bg-secondary',
                          isToday
                            ? 'bg-primary font-semibold text-primary-foreground hover:bg-primary'
                            : 'text-muted-foreground',
                        )}
                      >
                        {fromDateKey(key).getDate()}
                      </button>
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 3).map((t) => (
                          <Chip key={t.id} task={t} />
                        ))}
                        {dayTasks.length > 3 && (
                          <button
                            onClick={() => {
                              setFocus(key)
                              setView('day')
                            }}
                            className="px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            {t('calendar.more', { count: dayTasks.length - 3 })}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'week' && (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => addDays(startOfWeekKey(focus), i)).map((key, i) => {
            const dayTasks = byDay.get(key) ?? []
            return (
              <div
                key={key}
                className={cn(
                  'min-h-40 rounded-xl border border-border bg-card p-2.5',
                  key === today && 'border-primary/40 bg-primary/5',
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{weekdays[i]}</span>
                  <span className={cn('text-sm font-semibold', key === today ? 'text-primary' : 'text-foreground')}>
                    {fromDateKey(key).getDate()}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {dayTasks.map((t) => (
                    <Chip key={t.id} task={t} />
                  ))}
                  {dayTasks.length === 0 && <p className="text-[11px] text-muted-foreground/60">—</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'day' && (
        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-card p-5">
          {(byDay.get(focus) ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('calendar.emptyDay')}</p>
          ) : (
            (byDay.get(focus) ?? []).map((t) => (
              <button
                key={t.id}
                onClick={() => onEdit(t)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3 text-left transition-colors hover:border-primary/40"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: colorOf(t.projectId) }}
                />
                <span className={cn('flex-1 text-sm font-medium text-foreground', t.done && 'line-through opacity-60')}>
                  {t.title}
                </span>
                <span className="text-xs text-muted-foreground">{t.projectName}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
