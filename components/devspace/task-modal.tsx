'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { priorityMeta, taskStatusMeta, type Priority, type Project, type Task, type TaskStatus } from '@/lib/data'
import { todayKey } from '@/lib/dates'
import { localizeError, useI18n } from '@/lib/i18n'
import type { TaskInput, TaskPatch } from '@/lib/api-client'
import { Trash2, X } from 'lucide-react'

export type TaskModalState = {
  /** Если задана — режим редактирования */
  task?: Task
  /** Предзаполнение при создании */
  preset?: { projectId?: string; status?: TaskStatus; myDay?: boolean }
}

const inputCls =
  'h-9 w-full rounded-lg border border-border bg-secondary/40 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

export function TaskModal({
  state,
  projects,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  state: TaskModalState | null
  projects: Project[]
  onClose: () => void
  onCreate: (input: TaskInput) => Promise<unknown>
  onUpdate: (id: string, patch: TaskPatch) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}) {
  const { t } = useI18n()
  const editing = state?.task
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [status, setStatus] = useState<TaskStatus>('ideas')
  const [priority, setPriority] = useState<Priority>('medium')
  const [tags, setTags] = useState('')
  const [deadline, setDeadline] = useState('')
  const [estimate, setEstimate] = useState('')
  const [myDay, setMyDay] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Каждый раз, когда модалка открывается, заполняем форму заново
  useEffect(() => {
    if (!state) return
    const task = state.task
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setProjectId(task?.projectId ?? state.preset?.projectId ?? projects[0]?.id ?? '')
    setStatus(task?.status ?? state.preset?.status ?? 'ideas')
    setPriority(task?.priority ?? 'medium')
    setTags(task?.tags.join(', ') ?? '')
    setDeadline(task?.deadline ?? '')
    setEstimate(task?.estimate ?? '')
    setMyDay(task ? task.myDayDate === todayKey() : (state.preset?.myDay ?? false))
    setSubmitting(false)
    setConfirmDelete(false)
    setError(null)
  }, [state, projects])

  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, onClose])

  if (!state) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError(t('taskModal.err.title'))
      return
    }
    if (!projectId) {
      setError(t('taskModal.err.noProject'))
      return
    }
    setSubmitting(true)
    setError(null)

    const parsedTags = tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    const fields = {
      title: title.trim(),
      description,
      status,
      priority,
      tags: parsedTags,
      deadline: deadline || null,
      estimate,
      // «в My Day» хранится как дата; при редактировании не трогаем чужую дату, если галка не менялась
      myDayDate: myDay ? todayKey() : editing?.myDayDate === todayKey() ? null : (editing?.myDayDate ?? null),
    }

    try {
      if (editing) await onUpdate(editing.id, fields)
      else await onCreate({ projectId, ...fields })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? localizeError(t, err.message) : t('taskModal.err.save'))
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setSubmitting(true)
    try {
      await onDelete(editing.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? localizeError(t, err.message) : t('taskModal.err.delete'))
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={editing ? t('taskModal.edit.title') : t('taskModal.create.title')}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="scrollbar-thin relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {editing ? t('taskModal.edit.title') : t('taskModal.create.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editing ? t('taskModal.edit.subtitle') : t('taskModal.create.subtitle')}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} aria-label={t('common.close')}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          <Field label={t('taskModal.field.title')}>
            <input
              autoFocus
              className={inputCls}
              placeholder={t('taskModal.field.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </Field>

          <Field label={t('taskModal.field.description')}>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
              placeholder={t('taskModal.field.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('taskModal.field.project')}>
              <select
                className={cn(inputCls, 'appearance-none disabled:opacity-60')}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={!!editing}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('taskModal.field.status')}>
              <select
                className={cn(inputCls, 'appearance-none')}
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {(Object.keys(taskStatusMeta) as TaskStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {t(`taskStatus.${s}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('taskModal.field.priority')}>
              <select
                className={cn(inputCls, 'appearance-none')}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {(Object.keys(priorityMeta) as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {t(`priority.${p}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('taskModal.field.deadline')}>
              <input
                type="date"
                className={inputCls}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </Field>
            <Field label={t('taskModal.field.estimate')}>
              <input
                className={inputCls}
                placeholder={t('taskModal.field.estimatePlaceholder')}
                value={estimate}
                onChange={(e) => setEstimate(e.target.value)}
                maxLength={20}
              />
            </Field>
            <Field label={t('taskModal.field.tags')}>
              <input
                className={inputCls}
                placeholder={t('taskModal.field.tagsPlaceholder')}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Field>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={myDay}
              onChange={(e) => setMyDay(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            {t('taskModal.myDay')}
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
          <div>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={submitting}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                {confirmDelete ? t('taskModal.deleteConfirm') : t('taskModal.delete')}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('taskModal.saving') : editing ? t('taskModal.save') : t('taskModal.createBtn')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
