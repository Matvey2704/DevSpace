'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImagePlus, X } from 'lucide-react'

const templates = [
  'Web Application',
  'Mobile Application',
  'Backend Service',
  'Learning Project',
  'Personal Idea',
  'Portfolio Project',
]

const gradients = [
  'from-blue-500/70 to-cyan-500/40',
  'from-emerald-500/70 to-teal-500/40',
  'from-amber-500/70 to-orange-500/40',
  'from-indigo-500/70 to-blue-500/40',
  'from-rose-500/70 to-pink-500/40',
  'from-slate-500/70 to-zinc-500/40',
]

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'h-9 w-full rounded-lg border border-border bg-secondary/40 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none'

export function CreateProjectModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [template, setTemplate] = useState(templates[0])
  const [gradient, setGradient] = useState(gradients[0])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create project"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="scrollbar-thin relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        {/* Cover preview */}
        <div className={cn('relative h-32 bg-gradient-to-br', gradient)}>
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 backdrop-blur-md"
          >
            <X className="size-4" />
          </Button>
          <button className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/30 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/50">
            <ImagePlus className="size-3.5" />
            Upload cover
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Create Project
            </h2>
            <p className="text-sm text-muted-foreground">
              Set up a new workspace for your next build.
            </p>
          </div>

          {/* Templates */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Start from a template
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {templates.map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors',
                    template === t
                      ? 'border-primary/50 bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Project name">
              <input className={inputCls} placeholder="e.g. AutoHub" />
            </Field>
            <Field label="Project type">
              <input className={inputCls} defaultValue={template} readOnly />
            </Field>
          </div>

          <Field label="Short description">
            <textarea
              rows={2}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
              placeholder="What are you building?"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select className={cn(inputCls, 'appearance-none')}>
                <option>Planning</option>
                <option>In Progress</option>
                <option>Paused</option>
                <option>Completed</option>
              </select>
            </Field>
            <Field label="Technologies">
              <input className={inputCls} placeholder="React, TypeScript…" />
            </Field>
            <Field label="Start date">
              <input type="date" className={inputCls} />
            </Field>
            <Field label="Target completion">
              <input type="date" className={inputCls} />
            </Field>
          </div>

          {/* Theme gradient */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">
              Visual theme
            </span>
            <div className="flex flex-wrap gap-2">
              {gradients.map((g) => (
                <button
                  key={g}
                  onClick={() => setGradient(g)}
                  aria-label="Select theme"
                  className={cn(
                    'size-9 rounded-lg bg-gradient-to-br ring-offset-2 ring-offset-card transition-all',
                    g,
                    gradient === g && 'ring-2 ring-primary',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>Create Project</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
