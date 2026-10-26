'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { LOCALE_COOKIE, translate, type Locale, type TFn } from './core'

export * from './core'

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TFn
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    // cookie читает сервер в layout.tsx — поэтому язык не «мигает» при загрузке страницы
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`
    document.documentElement.lang = next
  }, [])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n должен вызываться внутри <I18nProvider>')
  return ctx
}
