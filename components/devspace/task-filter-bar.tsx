'use client'

import { priorityMeta, taskStatusMeta, type Priority, type Task, type TaskStatus } from '@/lib/data'
import { useI18n } from '@/lib/i18n'
import {
  allTags,
  deadlineOptions,
  emptyFilters,
  type DeadlineFilter,
  type TaskFilters,
} from '@/lib/task-filters'
import { FilterMenu } from './filter-menu'
import { SlidersHorizontal, X } from 'lucide-react'

const statusKeys = Object.keys(taskStatusMeta) as TaskStatus[]
const priorityKeys = Object.keys(priorityMeta) as Priority[]

// Строка фильтров, общая для списка задач проекта и экрана All Tasks
export function TaskFilterBar({
  tasks,
  filters,
  onChange,
}: {
  tasks: Task[]
  filters: TaskFilters
  onChange: (f: TaskFilters) => void
}) {
  const { t } = useI18n()
  const statusOptions = statusKeys.map((k) => ({ value: k, label: t(`taskStatus.${k}`) }))
  const priorityOptions = priorityKeys.map((k) => ({ value: k, label: t(`priority.${k}`) }))
  const deadlines = deadlineOptions.map((o) => ({ value: o.value, label: t(`tasks.deadline.${o.value}`) }))
  const active = Object.values(filters).some((v) => v !== null)
  const tagOptions = allTags(tasks).map((tag) => ({ value: tag, label: tag }))

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <SlidersHorizontal className="size-3.5" />
        {t('tasks.filters')}
      </span>
      <FilterMenu
        label={t('tasks.filter.status')}
        value={filters.status}
        options={statusOptions}
        onChange={(v) => onChange({ ...filters, status: v as TaskStatus | null })}
      />
      <FilterMenu
        label={t('tasks.filter.priority')}
        value={filters.priority}
        options={priorityOptions}
        onChange={(v) => onChange({ ...filters, priority: v as Priority | null })}
      />
      <FilterMenu
        label={t('tasks.filter.tags')}
        value={filters.tag}
        options={tagOptions}
        onChange={(v) => onChange({ ...filters, tag: v })}
      />
      <FilterMenu
        label={t('tasks.filter.deadline')}
        value={filters.deadline}
        options={deadlines}
        onChange={(v) => onChange({ ...filters, deadline: v as DeadlineFilter | null })}
      />
      {active && (
        <button
          onClick={() => onChange(emptyFilters)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3" />
          {t('common.clear')}
        </button>
      )}
    </div>
  )
}
