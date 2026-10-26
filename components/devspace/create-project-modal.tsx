'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/data'
import {
  createProject,
  statusToApi,
  updateProject,
  type ApiProject,
} from '@/lib/api-client'
import { fileToCoverDataUrl, gradientToDataUrl, MAX_COVER_SOURCE_MB } from '@/lib/image'
import { localizeError, useI18n } from '@/lib/i18n'
import { Check, ImagePlus, Trash2, Upload, X } from 'lucide-react'

const templates: { key: string; tech: string }[] = [
  { key: 'web', tech: 'React, TypeScript, Node.js' },
  { key: 'mobile', tech: 'React Native, TypeScript' },
  { key: 'backend', tech: 'Node.js, PostgreSQL' },
  { key: 'learning', tech: '' },
  { key: 'idea', tech: '' },
  { key: 'portfolio', tech: 'React, TypeScript, Tailwind' },
]

// Готовые обложки из /public/covers
const presetCovers = [
  { src: '/covers/devspace.png', label: 'DevSpace' },
  { src: '/covers/autohub.png', label: 'AutoHub' },
  { src: '/covers/portfolio.png', label: 'Portfolio' },
  { src: '/covers/learning.png', label: 'Learning' },
]

// Градиенты превращаются в настоящую картинку-обложку при выборе
const gradients = [
  { from: '#3b82f6', to: '#06b6d4' },
  { from: '#10b981', to: '#14b8a6' },
  { from: '#f59e0b', to: '#f97316' },
  { from: '#6366f1', to: '#3b82f6' },
  { from: '#f43f5e', to: '#ec4899' },
  { from: '#64748b', to: '#3f3f46' },
]

const statuses: Project['status'][] = ['planning', 'in-progress', 'paused', 'completed']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'h-9 w-full rounded-lg border border-border bg-secondary/40 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none'
const textareaCls =
  'w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none'

/** Создание проекта, а если передан project — его редактирование */
export function CreateProjectModal({
  open,
  project,
  onClose,
  onSaved,
}: {
  open: boolean
  project?: Project | null
  onClose: () => void
  onSaved?: (project: ApiProject) => void
}) {
  const { t } = useI18n()
  const editing = !!project
  const fileRef = useRef<HTMLInputElement>(null)

  const [template, setTemplate] = useState(templates[0].key)
  const [name, setName] = useState('')
  const [short, setShort] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Project['status']>('planning')
  const [tech, setTech] = useState('')
  const [techTouched, setTechTouched] = useState(false)
  const [cover, setCover] = useState<string | null>(null)
  const [gradientIdx, setGradientIdx] = useState<number | null>(null)
  const [coverBusy, setCoverBusy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Форма заполняется заново при каждом открытии
  useEffect(() => {
    if (!open) return
    setTemplate(templates[0].key)
    setName(project?.name ?? '')
    setShort(project?.short ?? '')
    setDescription(project && project.description !== project.short ? project.description : '')
    setStatus(project ? project.status : 'planning')
    setTech(project?.tech.join(', ') ?? templates[0].tech)
    setTechTouched(!!project)
    setCover(project?.cover || null)
    setGradientIdx(null)
    setCoverBusy(false)
    setSubmitting(false)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- сбрасываем форму только при открытии/смене проекта, а не при каждом пересчёте объекта
  }, [open, project?.id])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function pickTemplate(tpl: (typeof templates)[number]) {
    setTemplate(tpl.key)
    if (!techTouched) setTech(tpl.tech)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // чтобы можно было выбрать тот же файл повторно
    if (!file) return
    setCoverBusy(true)
    setError(null)
    try {
      setCover(await fileToCoverDataUrl(file))
      setGradientIdx(null)
    } catch (err) {
      setError(errorText(err, t('projectModal.err.image')))
    } finally {
      setCoverBusy(false)
    }
  }

  function pickGradient(i: number) {
    try {
      setCover(gradientToDataUrl(gradients[i].from, gradients[i].to))
      setGradientIdx(i)
      setError(null)
    } catch (err) {
      setError(errorText(err, t('projectModal.err.gradient')))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('projectModal.err.name'))
      return
    }
    setSubmitting(true)
    setError(null)

    const payload = {
      name: name.trim(),
      short: short.trim(),
      description: description.trim() || short.trim(),
      status: statusToApi(status),
      cover,
      tech: tech
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    try {
      const saved =
        editing && project ? await updateProject(project.id, payload) : await createProject(payload)
      onSaved?.(saved)
      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? localizeError(t, err.message)
          : editing
            ? t('projectModal.err.save')
            : t('projectModal.err.create'),
      )
      setSubmitting(false)
    }
  }

  const isPreset = (src: string) => cover === src

  // Ошибки из lib/image.ts приходят ключами словаря — переводим; остальные показываем как есть
  function errorText(err: unknown, fallback: string) {
    if (!(err instanceof Error)) return fallback
    if (err.message.startsWith('image.err.') || err.message.startsWith('projectModal.err.')) {
      return t(err.message, { mb: MAX_COVER_SOURCE_MB })
    }
    return err.message ? localizeError(t, err.message) : fallback
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={editing ? t('projectModal.edit.title') : t('projectModal.create.title')}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="scrollbar-thin relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Cover preview */}
        <div className="relative aspect-[16/6] min-h-32 overflow-hidden bg-gradient-to-br from-secondary to-muted">
          {cover ? (
            <img src={cover} alt={t('projectModal.cover.preview')} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              {t('projectModal.cover.none')}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onClose}
            aria-label={t('common.close')}
            className="absolute top-3 right-3 backdrop-blur-md"
          >
            <X className="size-4" />
          </Button>
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={coverBusy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/60 disabled:opacity-60"
            >
              <Upload className="size-3.5" />
              {coverBusy ? t('projectModal.cover.processing') : cover ? t('projectModal.cover.replace') : t('projectModal.cover.upload')}
            </button>
            {cover && (
              <button
                type="button"
                onClick={() => {
                  setCover(null)
                  setGradientIdx(null)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/60"
              >
                <Trash2 className="size-3.5" />
                {t('projectModal.cover.remove')}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        <div className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {editing ? t('projectModal.edit.title') : t('projectModal.create.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {editing ? t('projectModal.edit.subtitle') : t('projectModal.create.subtitle')}
            </p>
          </div>

          {/* Cover picker */}
          <div className="space-y-2.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ImagePlus className="size-3.5" />
              {t('projectModal.cover.choose')}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {presetCovers.map((c) => (
                <button
                  type="button"
                  key={c.src}
                  onClick={() => {
                    setCover(c.src)
                    setGradientIdx(null)
                  }}
                  aria-label={t('projectModal.cover.use', { name: c.label })}
                  aria-pressed={isPreset(c.src)}
                  className={cn(
                    'group relative aspect-[16/9] overflow-hidden rounded-lg border transition-all',
                    isPreset(c.src)
                      ? 'border-primary ring-2 ring-primary/60'
                      : 'border-border hover:border-primary/50',
                  )}
                >
                  <img src={c.src} alt="" className="size-full object-cover" />
                  {isPreset(c.src) && (
                    <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{t('projectModal.cover.orColor')}</span>
              {gradients.map((g, i) => (
                <button
                  type="button"
                  key={g.from}
                  onClick={() => pickGradient(i)}
                  aria-label={t('projectModal.cover.gradient')}
                  aria-pressed={gradientIdx === i}
                  style={{ backgroundImage: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                  className={cn(
                    'size-8 rounded-lg ring-offset-2 ring-offset-card transition-all',
                    gradientIdx === i && 'ring-2 ring-primary',
                  )}
                />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t('projectModal.cover.hint')}
            </p>
          </div>

          {/* Templates */}
          {!editing && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">{t('projectModal.template.label')}</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {templates.map((tpl) => (
                  <button
                    type="button"
                    key={tpl.key}
                    onClick={() => pickTemplate(tpl)}
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors',
                      template === tpl.key
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t(`projectModal.template.${tpl.key}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('projectModal.field.name')}>
              <input
                autoFocus
                className={inputCls}
                placeholder={t('projectModal.field.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </Field>
            <Field label={t('projectModal.field.status')}>
              <select
                className={cn(inputCls, 'appearance-none')}
                value={status}
                onChange={(e) => setStatus(e.target.value as Project['status'])}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {t(`projectStatus.${s}`)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label={t('projectModal.field.short')}>
            <textarea
              rows={2}
              className={textareaCls}
              placeholder={t('projectModal.field.shortPlaceholder')}
              value={short}
              onChange={(e) => setShort(e.target.value)}
              maxLength={200}
            />
          </Field>

          <Field label={t('projectModal.field.description')}>
            <textarea
              rows={3}
              className={textareaCls}
              placeholder={t('projectModal.field.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
          </Field>

          <Field label={t('projectModal.field.tech')}>
            <input
              className={inputCls}
              placeholder={t('projectModal.field.techPlaceholder')}
              value={tech}
              onChange={(e) => {
                setTech(e.target.value)
                setTechTouched(true)
              }}
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={submitting || coverBusy}>
              {submitting
                ? editing
                  ? t('projectModal.edit.submitting')
                  : t('projectModal.create.submitting')
                : editing
                  ? t('projectModal.edit.submit')
                  : t('projectModal.create.submit')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
