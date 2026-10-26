// Тонкая обёртка над fetch для работы с нашим API.
// Всё общение с БД идёт только через эти функции — компоненты не знают про Prisma/БД напрямую.

import type { Priority, Task, TaskStatus } from './data'
import type { TFn } from './i18n/core'

export type ApiProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed'
export type ApiTaskStatus = 'ideas' | 'planned' | 'in_progress' | 'review' | 'completed'

export type ApiProject = {
  id: string
  name: string
  short: string
  description: string
  cover: string | null
  status: ApiProjectStatus
  tech: string[]
  accent: string | null
  currentTask: string | null
  createdAt: string
  updatedAt: string
  userId: string
  tasksTotal: number
  tasksDone: number
  progress: number
}

export type ApiTask = {
  id: string
  title: string
  description: string | null
  status: ApiTaskStatus
  priority: Priority
  tags: string[]
  deadline: string | null
  estimate: string | null
  done: boolean
  completedAt: string | null
  myDayDate: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  projectId: string
  project?: { id: string; name: string }
}

// Достаём человекочитаемую ошибку из ответа API (сервер отдаёт { error: "..." })
async function parseOrThrow<T>(res: Response, fallback: string): Promise<T> {
  if (res.ok) return res.json()
  let message = fallback
  try {
    const data = await res.json()
    if (typeof data?.error === 'string') message = data.error
  } catch {
    /* тело не JSON — оставляем fallback */
  }
  throw new Error(message)
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

/* ------------------------------- Проекты ------------------------------- */

export async function fetchProjects(): Promise<ApiProject[]> {
  const res = await fetch('/api/projects')
  const data = await parseOrThrow<{ projects: ApiProject[] }>(res, 'Не удалось загрузить проекты')
  return data.projects
}

export type ProjectInput = {
  name: string
  short: string
  description: string
  tech: string[]
  status: ApiProjectStatus
  accent: string | null
  cover: string | null
}

export async function createProject(
  input: Partial<ProjectInput> & { name: string },
): Promise<ApiProject> {
  const res = await fetch('/api/projects', json('POST', input))
  const data = await parseOrThrow<{ project: ApiProject }>(res, 'Не удалось создать проект')
  return data.project
}

export async function updateProject(
  id: string,
  input: Partial<ProjectInput & { currentTask: string | null }>,
): Promise<ApiProject> {
  const res = await fetch(`/api/projects/${id}`, json('PATCH', input))
  const data = await parseOrThrow<{ project: ApiProject }>(res, 'Не удалось обновить проект')
  return data.project
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
  await parseOrThrow(res, 'Не удалось удалить проект')
}

export async function markProjectOpened(id: string): Promise<void> {
  await fetch(`/api/projects/${id}/open`, { method: 'POST' })
}

/* -------------------------------- Задачи -------------------------------- */

export async function fetchTasks(): Promise<ApiTask[]> {
  const res = await fetch('/api/tasks')
  const data = await parseOrThrow<{ tasks: ApiTask[] }>(res, 'Не удалось загрузить задачи')
  return data.tasks
}

export type TaskInput = {
  projectId: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  tags?: string[]
  /** "YYYY-MM-DD" или null */
  deadline?: string | null
  estimate?: string
  /** "YYYY-MM-DD" или null */
  myDayDate?: string | null
}

export type TaskPatch = Partial<
  Omit<TaskInput, 'projectId'> & {
    done: boolean
  }
>

function taskBody(input: Partial<TaskInput> & { done?: boolean }) {
  const { status, description, estimate, ...rest } = input
  return {
    ...rest,
    ...(status !== undefined ? { status: taskStatusToApi(status) } : {}),
    // пустые строки превращаем в null, чтобы очищать поля
    ...(description !== undefined ? { description: description.trim() || null } : {}),
    ...(estimate !== undefined ? { estimate: estimate.trim() || null } : {}),
  }
}

export async function createTask(input: TaskInput): Promise<Task> {
  const res = await fetch('/api/tasks', json('POST', taskBody(input)))
  const data = await parseOrThrow<{ task: ApiTask }>(res, 'Не удалось создать задачу')
  return toUiTask(data.task)
}

export async function updateTask(id: string, patch: TaskPatch): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, json('PATCH', taskBody(patch)))
  const data = await parseOrThrow<{ task: ApiTask }>(res, 'Не удалось обновить задачу')
  return toUiTask(data.task)
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  await parseOrThrow(res, 'Не удалось удалить задачу')
}

/* ------------------------- Конвертация API <-> UI ------------------------ */

// "in_progress" (формат БД) <-> "in-progress" (формат, который использует UI)
export function statusToUi(
  status: ApiProjectStatus,
): 'in-progress' | 'planning' | 'paused' | 'completed' {
  return status === 'in_progress' ? 'in-progress' : status
}

export function statusToApi(
  status: 'in-progress' | 'planning' | 'paused' | 'completed',
): ApiProjectStatus {
  return status === 'in-progress' ? 'in_progress' : status
}

export function taskStatusToUi(status: ApiTaskStatus): TaskStatus {
  return status === 'in_progress' ? 'in-progress' : status
}

export function taskStatusToApi(status: TaskStatus): ApiTaskStatus {
  return status === 'in-progress' ? 'in_progress' : status
}

export function toUiTask(t: ApiTask): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    projectId: t.projectId,
    projectName: t.project?.name ?? '',
    status: taskStatusToUi(t.status),
    priority: t.priority,
    tags: t.tags,
    deadline: t.deadline ? t.deadline.slice(0, 10) : null,
    estimate: t.estimate ?? '',
    createdAt: t.createdAt,
    // старые выполненные задачи без completedAt считаем завершёнными в момент последнего обновления
    completedAt: t.done ? (t.completedAt ?? t.updatedAt) : null,
    myDayDate: t.myDayDate ? t.myDayDate.slice(0, 10) : null,
    done: t.done,
  }
}

// «Обновлено 2 ч назад» из ISO-строки updatedAt
export function formatRelativeTime(iso: string, t: TFn): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return t('time.justNow')
  if (minutes < 60) return t('time.minutesAgo', { count: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('time.hoursAgo', { count: hours })
  const days = Math.floor(hours / 24)
  if (days === 1) return t('time.yesterday')
  if (days < 7) return t('time.daysAgo', { count: days })
  return t('time.weeksAgo', { count: Math.floor(days / 7) })
}
