// Типы и константы оформления для UI. Реальные данные приходят из API (см. lib/api-client.ts).
export type ProjectStatus = 'in-progress' | 'planning' | 'paused' | 'completed'
export type TaskStatus = 'ideas' | 'planned' | 'in-progress' | 'review' | 'completed'
export type Priority = 'high' | 'medium' | 'low'

export type Project = {
  id: string
  name: string
  short: string
  description: string
  cover: string
  status: ProjectStatus
  progress: number
  tasksDone: number
  tasksTotal: number
  tech: string[]
  /** ISO updatedAt — для сортировки и подписи «Обновлено …» */
  updatedAt: string
  accent: string
  currentTask: string
}

export type Task = {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  status: TaskStatus
  priority: Priority
  tags: string[]
  /** Дата дедлайна "YYYY-MM-DD" или null */
  deadline: string | null
  /** Оценка времени, например "2h" или "30m" */
  estimate: string
  /** ISO-время создания */
  createdAt: string
  /** ISO-время выполнения (null, если задача не выполнена) */
  completedAt: string | null
  /** "YYYY-MM-DD" — день, на который задача добавлена в My Day */
  myDayDate: string | null
  done: boolean
}

// Стили статусов/приоритетов. Подписи берутся из словарей: t(`projectStatus.${status}`),
// t(`taskStatus.${status}`), t(`priority.${priority}`).
export const statusMeta: Record<ProjectStatus, { className: string; dot: string }> = {
  'in-progress': { className: 'bg-info/12 text-info border-info/25', dot: 'bg-info' },
  planning: { className: 'bg-primary/12 text-primary border-primary/25', dot: 'bg-primary' },
  paused: { className: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
  completed: { className: 'bg-success/12 text-success border-success/25', dot: 'bg-success' },
}

export const taskStatusMeta: Record<TaskStatus, { dot: string }> = {
  ideas: { dot: 'bg-muted-foreground' },
  planned: { dot: 'bg-info' },
  'in-progress': { dot: 'bg-primary' },
  review: { dot: 'bg-warning' },
  completed: { dot: 'bg-success' },
}

export const priorityMeta: Record<Priority, { className: string; bar: string }> = {
  high: { className: 'bg-destructive/12 text-destructive border-destructive/25', bar: 'bg-destructive' },
  medium: { className: 'bg-warning/12 text-warning border-warning/25', bar: 'bg-warning' },
  low: { className: 'bg-muted text-muted-foreground border-border', bar: 'bg-muted-foreground' },
}
