'use client'

import { projects } from '@/lib/data'
import { ProgressBar } from '../primitives'
import { BarChart, DonutChart, Heatmap, LineChart } from '../charts'
import { TrendingUp } from 'lucide-react'

const kpis = [
  { label: 'Completed this week', value: '31', delta: '+12%' },
  { label: 'Completed this month', value: '128', delta: '+8%' },
  { label: 'Time spent', value: '46h', delta: '+5%' },
  { label: 'Completion rate', value: '84%', delta: '+3%' },
]

const weekly = [
  { label: 'W1', value: 22 },
  { label: 'W2', value: 28 },
  { label: 'W3', value: 19 },
  { label: 'W4', value: 31 },
]

const trend = [12, 18, 15, 22, 19, 28, 24, 31]

export function Analytics() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your development output and productivity trends.
        </p>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">
                {k.value}
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
                <TrendingUp className="size-3" />
                {k.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Productivity trend */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Productivity trend
            </h3>
            <span className="text-xs text-muted-foreground">Last 8 weeks</span>
          </div>
          <LineChart data={trend} className="mt-6" />
        </div>

        {/* Tasks by status */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Tasks by status</h3>
          <DonutChart
            className="mt-4"
            segments={[
              { label: 'Completed', value: 49, color: 'var(--success)' },
              { label: 'In Progress', value: 18, color: 'var(--primary)' },
              { label: 'Planned', value: 22, color: 'var(--info)' },
              { label: 'Review', value: 11, color: 'var(--warning)' },
            ]}
          />
        </div>

        {/* Weekly completed */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Completed tasks
          </h3>
          <span className="text-xs text-muted-foreground">By week</span>
          <BarChart data={weekly} className="mt-4" />
        </div>

        {/* Project progress comparison */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">
            Project progress comparison
          </h3>
          <div className="mt-4 space-y-4">
            {projects.map((p) => (
              <div key={p.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="flex size-5 items-center justify-center rounded-[5px] bg-primary/20 text-[9px] font-bold text-primary">
                      {p.name[0]}
                    </span>
                    {p.name}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {p.progress}%
                  </span>
                </div>
                <ProgressBar value={p.progress} />
              </div>
            ))}
          </div>
        </div>

        {/* Activity heatmap */}
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Activity heatmap
            </h3>
            <span className="text-xs text-muted-foreground">Last 16 weeks</span>
          </div>
          <div className="scrollbar-thin mt-4 overflow-x-auto pb-2">
            <Heatmap />
          </div>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
            Less
            <span className="size-3 rounded-[3px] bg-muted" />
            <span className="size-3 rounded-[3px] bg-primary/25" />
            <span className="size-3 rounded-[3px] bg-primary/45" />
            <span className="size-3 rounded-[3px] bg-primary/65" />
            <span className="size-3 rounded-[3px] bg-primary" />
            More
          </div>
        </div>
      </div>
    </div>
  )
}
