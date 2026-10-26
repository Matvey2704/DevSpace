'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'
import { Check, ChevronDown } from 'lucide-react'

export type FilterOption = { value: string; label: string }

// Маленький выпадающий список для фильтров и сортировки.
// value === null значит «не выбрано» (фильтр выключен)
export function FilterMenu({
  label,
  value,
  options,
  onChange,
  clearLabel,
  align = 'left',
  className,
}: {
  label: string
  value: string | null
  options: FilterOption[]
  onChange: (value: string | null) => void
  /** Текст пункта сброса; pass null чтобы убрать пункт (для сортировки) */
  clearLabel?: string | null
  align?: 'left' | 'right'
  className?: string
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const clearText = clearLabel === undefined ? t('common.any') : clearLabel
  const selected = options.find((o) => o.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs transition-colors hover:text-foreground',
          selected
            ? 'border-primary/50 text-foreground'
            : 'border-border text-muted-foreground hover:border-primary/40',
          className,
        )}
      >
        {label}
        {selected && <span className="font-medium text-primary">· {selected.label}</span>}
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            className={cn(
              'absolute top-full z-50 mt-2 max-h-72 min-w-40 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            {clearText !== null && (
              <button
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
              >
                {clearText}
                {value === null && <Check className="size-3.5" />}
              </button>
            )}
            {options.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">{t('common.nothingHere')}</p>
            )}
            {options.map((o) => (
              <button
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                  o.value === value ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {o.label}
                {o.value === value && <Check className="size-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
