import type { Task, TaskStatus } from '@/lib/data'

// Набор действий над задачами — собирается один раз в page.tsx и пробрасывается на экраны
export type TaskActions = {
  onToggle: (id: string) => void
  onMove: (id: string, status: TaskStatus) => void
  /** Открыть модалку создания задачи (с предзаполнением) */
  onCreate: (preset?: { projectId?: string; status?: TaskStatus; myDay?: boolean }) => void
  /** Открыть модалку редактирования задачи */
  onEdit: (task: Task) => void
}
