import type { Task } from './data'
import { addDays, fromDateKey, parseEstimateMinutes, startOfWeekKey, toDateKey, todayKey } from './dates'
import { intlLocale, type Locale } from './i18n/core'

/** Локальный ключ дня, в который задача была выполнена */
function completedKey(t: Task): string | null {
  return t.completedAt ? toDateKey(new Date(t.completedAt)) : null
}

/** dateKey -> сколько задач выполнено в этот день */
export function completedPerDay(tasks: Task[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of tasks) {
    const key = completedKey(t)
    if (key) map.set(key, (map.get(key) ?? 0) + 1)
  }
  return map
}

/** Выполненные задачи в диапазоне дней [fromKey, toKey] включительно */
export function completedBetween(tasks: Task[], fromKey: string, toKey: string): Task[] {
  return tasks.filter((t) => {
    const k = completedKey(t)
    return !!k && k >= fromKey && k <= toKey
  })
}

export function sumEstimateMinutes(tasks: Task[]): number {
  return tasks.reduce((sum, t) => sum + parseEstimateMinutes(t.estimate), 0)
}

/** Процент изменения; null, если сравнивать не с чем */
export function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

/** Сколько задач выполнено в каждой из последних N недель (от старых к новым, неделя с понедельника) */
export function weeklyCompleted(tasks: Task[], weeks: number): number[] {
  const perDay = completedPerDay(tasks)
  const thisMonday = startOfWeekKey(todayKey())
  const out: number[] = []
  for (let w = weeks - 1; w >= 0; w--) {
    const monday = addDays(thisMonday, -7 * w)
    let sum = 0
    for (let d = 0; d < 7; d++) sum += perDay.get(addDays(monday, d)) ?? 0
    out.push(sum)
  }
  return out
}

/** Выполнено по дням текущей недели (Пн..Вс) */
export function currentWeekByDay(tasks: Task[], locale: Locale): { label: string; value: number }[] {
  const perDay = completedPerDay(tasks)
  const monday = startOfWeekKey(todayKey())
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(monday, i)
    return {
      label: fromDateKey(key).toLocaleDateString(intlLocale(locale), { weekday: 'short' }),
      value: perDay.get(key) ?? 0,
    }
  })
}

/**
 * Данные для тепловой карты: weeks колонок по 7 дней (Пн..Вс), последняя колонка — текущая неделя.
 * Будущие дни помечены null.
 */
export function heatmapCells(tasks: Task[], weeks: number): (number | null)[] {
  const perDay = completedPerDay(tasks)
  const today = todayKey()
  const firstMonday = addDays(startOfWeekKey(today), -7 * (weeks - 1))
  const cells: (number | null)[] = []
  for (let i = 0; i < weeks * 7; i++) {
    const key = addDays(firstMonday, i)
    cells.push(key > today ? null : (perDay.get(key) ?? 0))
  }
  return cells
}

/**
 * Серия дней подряд, в которые что-то выполнено. Если сегодня ещё ничего нет,
 * серия не обрывается — считаем со вчерашнего дня.
 */
export function completionStreak(tasks: Task[]): { days: number; last7: boolean[] } {
  const perDay = completedPerDay(tasks)
  const today = todayKey()

  let cursor = perDay.has(today) ? today : addDays(today, -1)
  let days = 0
  while (perDay.has(cursor)) {
    days++
    cursor = addDays(cursor, -1)
  }

  const last7 = Array.from({ length: 7 }, (_, i) => perDay.has(addDays(today, i - 6)))
  return { days, last7 }
}
