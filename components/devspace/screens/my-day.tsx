'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { intlLocale, useI18n } from '@/lib/i18n'
import type { Priority, Task } from '@/lib/data'
import {
  formatMinutes,
  greetingKey,
  isOverdue,
  parseEstimateMinutes,
  toDateKey,
  todayKey,
} from '@/lib/dates'
import { ProgressBar } from '../primitives'
import { TaskRow } from '../task-row'
import type { TaskActions } from '../task-actions'
import { Pause, Play, Plus, RotateCcw, SkipForward, Timer } from 'lucide-react'

const FOCUS_SECONDS = 45 * 60

const groups: { key: Priority; dot: string }[] = [
  { key: 'high', dot: 'bg-destructive' },
  { key: 'medium', dot: 'bg-warning' },
  { key: 'low', dot: 'bg-muted-foreground' },
]

const fmtClock = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

/**
 * В My Day попадают задачи, которые:
 *  - добавлены в My Day на сегодня, или
 *  - имеют дедлайн сегодня / просрочены и ещё не выполнены, или выполнены сегодня.
 */
function selectMyDay(tasks: Task[]): Task[] {
  const today = todayKey()
  return tasks.filter((t) => {
    if (t.myDayDate === today) return true
    if (!t.deadline || t.deadline > today) return false
    if (!t.done) return true
    // задача с дедлайном «до сегодня», закрытая сегодня, остаётся в списке — иначе прогресс дня не растёт
    return !!t.completedAt && toDateKey(new Date(t.completedAt)) === today
  })
}

export function MyDay({
  tasks,
  userName,
  actions,
}: {
  tasks: Task[]
  userName: string
  actions: TaskActions
}) {
  const { t, locale } = useI18n()
  const today = new Date().toLocaleDateString(intlLocale(locale), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const dayTasks = selectMyDay(tasks)
  const total = dayTasks.length
  const done = dayTasks.filter((t) => t.done).length
  const left = dayTasks.filter((t) => !t.done)
  const estLeft = left.reduce((sum, t) => sum + parseEstimateMinutes(t.estimate), 0)
  const overdue = dayTasks.filter(isOverdue).length

  // Focus mode: текущая = первая в работе, иначе первая невыполненная (по приоритету)
  const rank = { high: 0, medium: 1, low: 2 } as const
  const queue = [...left].sort(
    (a, b) =>
      Number(b.status === 'in-progress') - Number(a.status === 'in-progress') ||
      rank[a.priority] - rank[b.priority],
  )
  const [skipped, setSkipped] = useState(0)
  const current = queue.length ? queue[skipped % queue.length] : undefined
  const next = queue.length > 1 ? queue[(skipped + 1) % queue.length] : undefined

  const [seconds, setSeconds] = useState(FOCUS_SECONDS)
  const [running, setRunning] = useState(false)
  const currentId = useRef(current?.id)

  // Таймер сбрасывается, когда меняется текущая задача
  useEffect(() => {
    if (currentId.current !== current?.id) {
      currentId.current = current?.id
      setSeconds(FOCUS_SECONDS)
      setRunning(false)
    }
  }, [current?.id])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {today}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            {t(greetingKey())}, {userName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total === 0
              ? t('myDay.summary.empty')
              : left.length === 0
                ? t('myDay.summary.allDone')
                : t('myDay.summary.left', { count: left.length })}
          </p>
        </div>
        <Button onClick={() => actions.onCreate({ myDay: true })}>
          <Plus className="size-4" />
          {t('myDay.add')}
        </Button>
      </div>

      {/* Daily summary */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="grid grid-cols-3 gap-3 lg:col-span-2">
          {[
            { label: t('myDay.stat.done'), value: `${done}/${total}` },
            { label: t('myDay.stat.estLeft'), value: formatMinutes(estLeft, t) },
            { label: t('myDay.stat.overdue'), value: String(overdue) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
          <div className="col-span-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('myDay.dailyProgress')}</span>
              <span className="font-mono font-medium text-foreground">
                {total === 0 ? 0 : Math.round((done / total) * 100)}%
              </span>
            </div>
            <ProgressBar value={total === 0 ? 0 : (done / total) * 100} className="mt-3 h-2" />
          </div>
        </div>

        {/* Focus mode */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-primary uppercase">
            <Timer className="size-4" />
            {t('myDay.focus.title')}
          </div>
          {current ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">{t('myDay.focus.current')}</p>
              <h3 className="mt-0.5 text-lg font-semibold text-foreground">{current.title}</h3>
              <p className="text-xs text-muted-foreground">{current.projectName}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-semibold text-foreground tabular-nums">
                  {fmtClock(seconds)}
                </span>
                <span className="text-xs text-muted-foreground">/ {fmtClock(FOCUS_SECONDS)}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => setRunning((r) => !r)} disabled={seconds === 0}>
                  {running ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {running ? t('myDay.focus.pause') : seconds === FOCUS_SECONDS ? t('myDay.focus.start') : t('myDay.focus.resume')}
                </Button>
                {seconds !== FOCUS_SECONDS && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRunning(false)
                      setSeconds(FOCUS_SECONDS)
                    }}
                  >
                    <RotateCcw className="size-4" />
                    {t('myDay.focus.reset')}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => actions.onToggle(current.id)}>
                  {t('myDay.focus.done')}
                </Button>
                {next && (
                  <Button variant="outline" size="sm" onClick={() => setSkipped((n) => n + 1)}>
                    <SkipForward className="size-4" />
                    {t('myDay.focus.next')}
                  </Button>
                )}
              </div>
              {next && (
                <div className="mt-4 border-t border-primary/20 pt-3 text-xs">
                  <span className="text-muted-foreground">{t('myDay.focus.upNext')}</span>
                  <span className="font-medium text-foreground">
                    {next.title} — {next.projectName}
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {t('myDay.focus.empty')}
            </p>
          )}
        </div>
      </div>

      {/* Grouped tasks */}
      <div className="mt-8 space-y-6">
        {total === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t('myDay.clear.title')}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t('myDay.clear.hint')}
            </p>
          </div>
        )}
        {groups.map((g) => {
          const list = dayTasks.filter((t) => t.priority === g.key)
          if (list.length === 0) return null
          return (
            <section key={g.key}>
              <div className="mb-3 flex items-center gap-2">
                <span className={cn('size-2 rounded-full', g.dot)} />
                <h2 className="text-sm font-semibold text-foreground">{t(`myDay.group.${g.key}`)}</h2>
                <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {list.length}
                </span>
              </div>
              <div className="space-y-2">
                {list.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggle={actions.onToggle}
                    onEdit={actions.onEdit}
                    showProject
                  />
                ))}
              </div>
            </section>
          )
        })}

        <button
          onClick={() => actions.onCreate({ myDay: true })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="size-4" />
          {t('myDay.quickAdd')}
        </button>
      </div>
    </div>
  )
}
