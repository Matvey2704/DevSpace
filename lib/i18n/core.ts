import { ru } from './ru'
import { en } from './en'

// Чистая (серверно-безопасная) часть i18n: без React и без 'use client'.
// Её можно импортировать и из server-компонентов (layout.tsx), и из клиентских.

export type Locale = 'ru' | 'en'

export const DEFAULT_LOCALE: Locale = 'ru'
export const LOCALE_COOKIE = 'locale'

export const LOCALES: { code: Locale; native: string; short: string }[] = [
  { code: 'ru', native: 'Русский', short: 'RU' },
  { code: 'en', native: 'English', short: 'EN' },
]

const dictionaries: Record<Locale, Record<string, string>> = { ru, en }

export function isLocale(value: unknown): value is Locale {
  return value === 'ru' || value === 'en'
}

/** Локаль для Intl / toLocaleDateString */
export function intlLocale(locale: Locale): string {
  return locale === 'ru' ? 'ru-RU' : 'en-US'
}

export type TFn = (key: string, vars?: Record<string, string | number>) => string

/**
 * Перевод по ключу. Поддерживает подстановки {name} и плюрализацию:
 * если в vars есть count и в словаре есть ключи key_one / key_few / key_many / key_other,
 * выбирается нужная форма по правилам языка.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = dictionaries[locale]
  let template: string | undefined

  if (vars && typeof vars.count === 'number') {
    const category = new Intl.PluralRules(intlLocale(locale)).select(vars.count)
    template = dict[`${key}_${category}`] ?? dict[`${key}_other`]
  }
  template ??= dict[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key

  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  )
}

/** Переводит текст ошибки (приходит с сервера на русском); неизвестные сообщения возвращает как есть */
export function localizeError(t: TFn, message: string): string {
  const key = `serverError.${message}`
  const translated = t(key)
  return translated === key ? message : translated
}
