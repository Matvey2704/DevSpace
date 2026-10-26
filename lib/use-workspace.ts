'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Project, Task, TaskStatus } from './data'
import {
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  fetchProjects,
  fetchTasks,
  statusToUi,
  toUiTask,
  updateTask as apiUpdateTask,
  type ApiProject,
  type TaskInput,
  type TaskPatch,
} from './api-client'

// Применяет патч к задаче локально (оптимистично), повторяя серверные правила:
// done <=> status === 'completed'
function applyPatch(task: Task, patch: TaskPatch): Task {
  const next: Task = { ...task }
  if (patch.title !== undefined) next.title = patch.title
  if (patch.description !== undefined) next.description = patch.description
  if (patch.priority !== undefined) next.priority = patch.priority
  if (patch.tags !== undefined) next.tags = patch.tags
  if (patch.deadline !== undefined) next.deadline = patch.deadline
  if (patch.estimate !== undefined) next.estimate = patch.estimate
  if (patch.myDayDate !== undefined) next.myDayDate = patch.myDayDate

  let status: TaskStatus | undefined = patch.status
  if (status === undefined && patch.done !== undefined) {
    status = patch.done ? 'completed' : task.status === 'completed' ? 'planned' : task.status
  }
  if (status !== undefined) {
    next.status = status
    next.done = status === 'completed'
    if (next.done && !task.done) next.completedAt = new Date().toISOString()
    if (!next.done) next.completedAt = null
  }
  return next
}

/**
 * Единый источник данных для всего приложения: проекты + задачи.
 * Прогресс проектов считается из задач на клиенте, поэтому отметка задачи
 * сразу отражается в библиотеке, аналитике и сайдбаре без перезагрузки.
 */
export function useWorkspace(enabled = true) {
  const [apiProjects, setApiProjects] = useState<ApiProject[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  const notifyError = useCallback((message: string) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4500)
  }, [])

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [p, t] = await Promise.all([fetchProjects(), fetchTasks()])
      setApiProjects(p)
      setTasks(t.map(toUiTask))
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) load()
  }, [enabled, load])

  const touchProject = useCallback((projectId: string) => {
    const now = new Date().toISOString()
    setApiProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, updatedAt: now } : p)),
    )
  }, [])

  /* ------------------------------ Проекты ------------------------------ */

  const addProject = useCallback((project: ApiProject) => {
    setApiProjects((prev) => [project, ...prev])
  }, [])

  const replaceProject = useCallback((project: ApiProject) => {
    setApiProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)))
  }, [])

  const removeProjectLocal = useCallback((id: string) => {
    setApiProjects((prev) => prev.filter((p) => p.id !== id))
    setTasks((prev) => prev.filter((t) => t.projectId !== id))
  }, [])

  /* ------------------------------- Задачи ------------------------------ */

  const addTask = useCallback(
    async (input: TaskInput) => {
      const created = await apiCreateTask(input) // ошибку ловит модалка
      setTasks((prev) => [created, ...prev])
      touchProject(created.projectId)
      return created
    },
    [touchProject],
  )

  // Оптимистичное обновление с откатом при ошибке сервера
  const patchTask = useCallback(
    async (id: string, patch: TaskPatch, opts?: { throwOnError?: boolean }) => {
      const before = tasksRef.current.find((t) => t.id === id)
      if (!before) return
      setTasks((prev) => prev.map((t) => (t.id === id ? applyPatch(t, patch) : t)))
      try {
        const saved = await apiUpdateTask(id, patch)
        setTasks((prev) => prev.map((t) => (t.id === id ? saved : t)))
        touchProject(before.projectId)
      } catch (e) {
        setTasks((prev) => prev.map((t) => (t.id === id ? before : t)))
        const message = e instanceof Error ? e.message : 'Не удалось обновить задачу'
        if (opts?.throwOnError) throw e instanceof Error ? e : new Error(message)
        notifyError(message)
      }
    },
    [notifyError, touchProject],
  )

  const toggleTask = useCallback(
    (id: string) => {
      const task = tasksRef.current.find((t) => t.id === id)
      if (task) patchTask(id, { done: !task.done })
    },
    [patchTask],
  )

  const moveTask = useCallback(
    (id: string, status: TaskStatus) => {
      const task = tasksRef.current.find((t) => t.id === id)
      if (task && task.status !== status) patchTask(id, { status })
    },
    [patchTask],
  )

  const removeTask = useCallback(
    async (id: string, opts?: { throwOnError?: boolean }) => {
      const before = tasksRef.current.find((t) => t.id === id)
      if (!before) return
      setTasks((prev) => prev.filter((t) => t.id !== id))
      try {
        await apiDeleteTask(id)
        touchProject(before.projectId)
      } catch (e) {
        setTasks((prev) => [before, ...prev])
        const message = e instanceof Error ? e.message : 'Не удалось удалить задачу'
        if (opts?.throwOnError) throw e instanceof Error ? e : new Error(message)
        notifyError(message)
      }
    },
    [notifyError, touchProject],
  )

  /* ------------------------- Производные данные ------------------------ */

  const projects: Project[] = useMemo(() => {
    return apiProjects.map((p) => {
      const own = tasks.filter((t) => t.projectId === p.id)
      const tasksTotal = own.length
      const tasksDone = own.filter((t) => t.done).length
      const progress = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100)
      // «Текущая задача» — самая приоритетная из тех, что сейчас в работе
      const rank = { high: 0, medium: 1, low: 2 } as const
      const current = own
        .filter((t) => t.status === 'in-progress')
        .sort((a, b) => rank[a.priority] - rank[b.priority])[0]

      return {
        id: p.id,
        name: p.name,
        short: p.short,
        description: p.description,
        cover: p.cover ?? '',
        status: statusToUi(p.status),
        progress,
        tasksDone,
        tasksTotal,
        tech: p.tech,
        updatedAt: p.updatedAt,
        accent: p.accent ?? 'var(--primary)',
        currentTask: current?.title ?? p.currentTask ?? '',
      }
    })
  }, [apiProjects, tasks])

  return {
    projects,
    tasks,
    loading,
    loadError,
    reload: load,
    toast,
    notifyError,
    dismissToast: () => setToast(null),
    addProject,
    replaceProject,
    removeProjectLocal,
    addTask,
    patchTask,
    toggleTask,
    moveTask,
    removeTask,
  }
}
