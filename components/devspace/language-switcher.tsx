'use client'

import { cn } from '@/lib/utils'
import { LOCALES, useI18n } from '@/lib/i18n'

// Компактный переключатель RU | EN — для страниц входа/регистрации
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n()
  return (
    <div
      role="group"
      aria-label={t('settings.language.title')}
      className={cn('inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1', className)}
    >
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={locale === l.code}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            locale === l.code
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}
