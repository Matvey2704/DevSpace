import type { Priority, Task, TaskStatus } from './data'
import { addDays, isOverdue, startOfWeekKey, todayKey } from './dates'

export type DeadlineFilter = 'overdue' | 'today' | 'week' | 'none'

export type TaskFilters = {
  status: TaskStatus | null
  priority: Priority | null
  tag: string | null
  deadline: DeadlineFilter | null
}

export const emptyFilters: TaskFilters = {
  status: null,
  priority: null,
  tag: null,
  deadline: null,
}

export const deadlineOptions: { value: DeadlineFilter; label: string }[] = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'none', label: 'No deadline' },
]

export function applyTaskFilters(tasks: Task[], f: TaskFilters, query = ''): Task[] {
  const q = query.trim().toLowerCase()
  const today = todayKey()
  const weekEnd = addDays(startOfWeekKey(today), 6)

  return tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false
    if (f.status && t.status !== f.status) return false
    if (f.priority && t.priority !== f.priority) return false
    if (f.tag && !t.tags.includes(f.tag)) return false
    switch (f.deadline) {
      case 'overdue':
        return isOverdue(t)
      case 'today':
        return t.deadline === today
      case 'week':
        return !!t.deadline && t.deadline >= today && t.deadline <= weekEnd
      case 'none':
        return t.deadline === null
      default:
        return true
    }
  })
}

export function allTags(tasks: Task[]): string[] {
  return [...new Set(tasks.flatMap((t) => t.tags))].sort()
}

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export type TaskSort = 'deadline' | 'priority' | 'newest'

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const list = [...tasks]
  if (sort === 'priority') {
    return list.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
  }
  if (sort === 'newest') {
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  // deadline: ближайшие первыми, без дедлайна — в конце
  return list.sort((a, b) => {
    if (a.deadline === b.deadline) return 0
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return a.deadline.localeCompare(b.deadline)
  })
}
