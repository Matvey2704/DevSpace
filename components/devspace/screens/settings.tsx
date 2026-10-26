'use client'

import { cn } from '@/lib/utils'
import { LOCALES, useI18n } from '@/lib/i18n'
import { Check, Globe, UserRound } from 'lucide-react'

type SettingsUser = { name: string | null; email: string } | null

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <Icon className="size-4.5" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function Settings({ user }: { user: SettingsUser }) {
  const { t, locale, setLocale } = useI18n()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('settings.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <div className="mt-6 space-y-5">
        <Section
          icon={Globe}
          title={t('settings.language.title')}
          description={t('settings.language.description')}
        >
          <div role="radiogroup" aria-label={t('settings.language.title')} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LOCALES.map((l) => {
              const active = locale === l.code
              return (
                <button
                  key={l.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLocale(l.code)}
                  className={cn(
                    'flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors',
                    active
                      ? 'border-primary/60 bg-primary/10'
                      : 'border-border bg-secondary/30 hover:border-primary/40',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-md border border-border bg-card font-mono text-xs font-semibold text-foreground">
                      {l.short}
                    </span>
                    <span className="text-sm font-medium text-foreground">{l.native}</span>
                  </span>
                  {active && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Section>

        <Section icon={UserRound} title={t('settings.account.title')}>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted-foreground">{t('settings.account.name')}</dt>
              <dd className="mt-1 text-sm text-foreground">{user?.name || t('settings.account.empty')}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">{t('settings.account.email')}</dt>
              <dd className="mt-1 truncate text-sm text-foreground">{user?.email ?? t('settings.account.empty')}</dd>
            </div>
          </dl>
        </Section>
      </div>
    </div>
  )
}
