import { intlLocale, type Locale, type TFn } from './i18n/core'

// Работа с датами без привязки к часовым поясам.
// Дедлайны храним/передаём как ключ "YYYY-MM-DD" и сравниваем строками.

const pad = (n: number) => String(n).padStart(2, '0')

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

/** Ключ "YYYY-MM-DD" -> Date в локальной полночи */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, n: number): string {
  const d = fromDateKey(key)
  d.setDate(d.getDate() + n)
  return toDateKey(d)
}

/** Понедельник недели, в которую попадает дата */
export function startOfWeekKey(key: string): string {
  const d = fromDateKey(key)
  const shift = (d.getDay() + 6) % 7 // Пн=0 ... Вс=6
  d.setDate(d.getDate() - shift)
  return toDateKey(d)
}

export function formatDeadline(key: string, locale: Locale, t: TFn): string {
  const today = todayKey()
  if (key === today) return t('common.today')
  if (key === addDays(today, 1)) return t('common.tomorrow')
  if (key === addDays(today, -1)) return t('common.yesterday')
  const d = fromDateKey(key)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString(intlLocale(locale), {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

export function isOverdue(task: { done: boolean; deadline: string | null }): boolean {
  return !task.done && !!task.deadline && task.deadline < todayKey()
}

/** "2h" | "30m" | "1h 30m" | "1.5h" -> минуты. Непонятное значение -> 0 */
export function parseEstimateMinutes(estimate: string): number {
  const s = estimate.trim().toLowerCase()
  if (!s) return 0
  let total = 0
  const re = /(\d+(?:[.,]\d+)?)\s*(h|ч|m|min|м)/g
  let match: RegExpExecArray | null
  let found = false
  while ((match = re.exec(s))) {
    found = true
    const value = parseFloat(match[1].replace(',', '.'))
    total += /^(h|ч)$/.test(match[2]) ? value * 60 : value
  }
  if (!found && /^\d+(?:[.,]\d+)?$/.test(s)) return parseFloat(s.replace(',', '.')) * 60 // "3" = 3 часа
  return Math.round(total)
}

export function formatMinutes(min: number, t: TFn): string {
  const hu = t('common.hours')
  const mu = t('common.minutes')
  if (min <= 0) return `0${hu}`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}${mu}`
  return m === 0 ? `${h}${hu}` : `${h}${hu} ${m}${mu}`
}

export function greetingKey(date = new Date()): string {
  const h = date.getHours()
  if (h < 5) return 'myDay.greeting.night'
  if (h < 12) return 'myDay.greeting.morning'
  if (h < 18) return 'myDay.greeting.afternoon'
  return 'myDay.greeting.evening'
}
