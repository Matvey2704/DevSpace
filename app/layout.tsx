import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, translate, type Locale } from '@/lib/i18n/core'
import { I18nProvider } from '@/lib/i18n'
import './globals.css'

// Язык берём из cookie, которую ставит переключатель в настройках. По умолчанию — русский.
async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return {
    title: translate(locale, 'meta.title'),
    description: translate(locale, 'meta.description'),
    generator: 'v0.app',
  }
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#131317',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background font-sans antialiased">
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
