'use client'

import { cn } from '@/lib/utils'

export function BarChart({
  data,
  className,
  barClassName,
}: {
  data: { label: string; value: number }[]
  className?: string
  barClassName?: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className={cn('flex h-40 items-end gap-2', className)}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className={cn(
                'w-full rounded-t-md bg-primary/80 transition-all',
                barClassName,
              )}
              style={{ height: `${(d.value / max) * 100}%` }}
              title={`${d.value}`}
            />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function LineChart({
  data,
  className,
}: {
  data: number[]
  className?: string
}) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 300
  const h = 120
  const step = data.length > 1 ? w / (data.length - 1) : 0
  const points = data.map((v, i) => {
    const x = i * step
    const y = h - ((v - min) / range) * (h - 10) - 5
    return [x, y] as const
  })
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ')
  const area = `${path} L ${w} ${h} L 0 ${h} Z`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn('h-32 w-full', className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lineFill)" />
      <path
        d={path}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="var(--primary)" />
      ))}
    </svg>
  )
}

export function DonutChart({
  segments,
  className,
}: {
  segments: { label: string; value: number; color: string }[]
  className?: string
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const radius = 42
  const circ = 2 * Math.PI * radius
  let offset = 0
  return (
    <div className={cn('flex items-center gap-6', className)}>
      <svg viewBox="0 0 100 100" className="size-32 -rotate-90">
        {segments.map((s) => {
          const len = (s.value / total) * circ
          const dash = `${len} ${circ - len}`
          const el = (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="10"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
            />
          )
          offset += len
          return el
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-mono font-medium text-foreground">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Тепловая карта активности. cells — по 7 значений на неделю (Пн..Вс), от старых недель к новым;
 * null — день в будущем.
 */
export function Heatmap({
  cells,
  tooltip,
}: {
  cells: (number | null)[]
  tooltip: (count: number) => string
}) {
  const max = Math.max(...cells.map((c) => c ?? 0), 0)
  const levels = [
    'bg-muted',
    'bg-primary/25',
    'bg-primary/45',
    'bg-primary/65',
    'bg-primary',
  ]
  const levelOf = (n: number) => (n === 0 || max === 0 ? 0 : Math.max(1, Math.ceil((n / max) * 4)))
  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1">
      {cells.map((n, i) =>
        n === null ? (
          <span key={i} className="size-3" />
        ) : (
          <span
            key={i}
            className={cn('size-3 rounded-[3px]', levels[levelOf(n)])}
            title={tooltip(n)}
          />
        ),
      )}
    </div>
  )
}
