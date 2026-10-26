'use client'

import type { Project, Task } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import { addDays, formatMinutes, todayKey } from '@/lib/dates'
import {
  completedBetween,
  deltaPercent,
  heatmapCells,
  sumEstimateMinutes,
  weeklyCompleted,
} from '@/lib/stats'
import { ProgressBar } from '../primitives'
import { BarChart, DonutChart, Heatmap, LineChart } from '../charts'
import { TrendingDown, TrendingUp } from 'lucide-react'

function Delta({ value }: { value: number | null }) {
  if (value === null) return null
  const up = value >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-success' : 'text-destructive'}`}
    >
      <Icon className="size-3" />
      {up ? '+' : ''}
      {value}%
    </span>
  )
}

export function Analytics({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
  const { t } = useI18n()
  const today = todayKey()

  // Скользящие окна: последние 7/30 дней против предыдущих 7/30
  const week = completedBetween(tasks, addDays(today, -6), today)
  const prevWeek = completedBetween(tasks, addDays(today, -13), addDays(today, -7))
  const month = completedBetween(tasks, addDays(today, -29), today)
  const prevMonth = completedBetween(tasks, addDays(today, -59), addDays(today, -30))
  const weekMinutes = sumEstimateMinutes(week)
  const prevWeekMinutes = sumEstimateMinutes(prevWeek)

  const doneAll = tasks.filter((t) => t.done).length
  const completionRate = tasks.length === 0 ? 0 : Math.round((doneAll / tasks.length) * 100)

  const kpis = [
    { label: t('analytics.kpi.week'), value: String(week.length), delta: deltaPercent(week.length, prevWeek.length) },
    { label: t('analytics.kpi.month'), value: String(month.length), delta: deltaPercent(month.length, prevMonth.length) },
    { label: t('analytics.kpi.time'), value: formatMinutes(weekMinutes, t), delta: deltaPercent(weekMinutes, prevWeekMinutes) },
    { label: t('analytics.kpi.rate'), value: `${completionRate}%`, delta: null },
  ]

  const trend = weeklyCompleted(tasks, 8)
  const lastWeeks = weeklyCompleted(tasks, 4).map((value, i) => ({ label: `W${i + 1}`, value }))

  const count = (status: Task['status']) => tasks.filter((task) => task.status === status).length
  const segments = [
    { label: t('taskStatus.completed'), value: count('completed'), color: 'var(--success)' },
    { label: t('taskStatus.in-progress'), value: count('in-progress'), color: 'var(--primary)' },
    { label: t('taskStatus.planned'), value: count('planned'), color: 'var(--info)' },
    { label: t('taskStatus.review'), value: count('review'), color: 'var(--warning)' },
    { label: t('taskStatus.ideas'), value: count('ideas'), color: 'var(--muted-foreground)' },
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('analytics.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('analytics.subtitle')}
        </p>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">{k.value}</span>
              <Delta value={k.delta} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Productivity trend */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{t('analytics.trend')}</h3>
            <span className="text-xs text-muted-foreground">{t('analytics.last8')}</span>
          </div>
          <LineChart data={trend} className="mt-6" />
        </div>

        {/* Tasks by status */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">{t('analytics.byStatus')}</h3>
          {tasks.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">{t('analytics.noTasks')}</p>
          ) : (
            <DonutChart className="mt-4" segments={segments} />
          )}
        </div>

        {/* Weekly completed */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">{t('analytics.completed')}</h3>
          <span className="text-xs text-muted-foreground">{t('analytics.byWeek')}</span>
          <BarChart data={lastWeeks} className="mt-4" />
        </div>

        {/* Project progress comparison */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">{t('analytics.comparison')}</h3>
          <div className="mt-4 space-y-4">
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('analytics.noProjects')}</p>
            )}
            {projects.map((p) => (
              <div key={p.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="flex size-5 items-center justify-center rounded-[5px] bg-primary/20 text-[9px] font-bold text-primary">
                      {p.name[0]}
                    </span>
                    {p.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{p.progress}%</span>
                </div>
                <ProgressBar value={p.progress} />
              </div>
            ))}
          </div>
        </div>

        {/* Activity heatmap */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{t('analytics.heatmap')}</h3>
            <span className="text-xs text-muted-foreground">{t('analytics.last16')}</span>
          </div>
          <div className="scrollbar-thin mt-4 overflow-x-auto pb-2">
            <Heatmap cells={heatmapCells(tasks, 16)} tooltip={(n) => t('analytics.heatmap.tooltip', { count: n })} />
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
            {t('analytics.less')}
            <span className="size-3 rounded-[3px] bg-muted" />
            <span className="size-3 rounded-[3px] bg-primary/25" />
            <span className="size-3 rounded-[3px] bg-primary/45" />
            <span className="size-3 rounded-[3px] bg-primary/65" />
            <span className="size-3 rounded-[3px] bg-primary" />
            {t('analytics.more')}
          </div>
        </div>
      </div>
    </div>
  )
}
