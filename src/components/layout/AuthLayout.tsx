'use client'

import { useTranslations } from 'next-intl'
import { Logo } from './Logo'

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  const t = useTranslations('auth')
  return (
    <div className="flex min-h-screen bg-gradient-hero">
      {/* Left — form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-10" />
          <h1 className="font-display text-2xl font-bold text-zinc-50">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>

      {/* Right — visual */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-radial from-green-500/20 via-transparent to-transparent" />
        <div className="flex h-full flex-col items-center justify-center p-16">
          <div className="max-w-md text-center">
            <div className="mb-8 flex justify-center gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-green-500"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight text-zinc-50">
              {t('authHeroTitle')}
            </h2>
            <p className="mt-4 text-zinc-400">
              {t('authHeroSubtitle')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
