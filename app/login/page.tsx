'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { localizeError, useI18n } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/devspace/language-switcher'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'auth.login.failed')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4">
      <LanguageSwitcher />
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <h1 className="text-xl font-semibold text-foreground">{t('auth.login.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('auth.login.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error.startsWith('auth.') ? t(error) : localizeError(t, error)}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('auth.login.noAccount')}{' '}
          <Link href="/register" className="font-medium text-foreground hover:underline">
            {t('auth.register.submit')}
          </Link>
        </p>
      </div>
    </div>
  )
}