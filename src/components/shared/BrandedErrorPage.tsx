'use client'

import { useTranslations } from 'next-intl'
import { AlertTriangle, House } from 'lucide-react'
import { Link } from '@/navigation'
import { Logo } from '@/components/layout/Logo'

interface ErrorLink {
  label: string
  href: string
  variant?: 'secondary' | 'ghost'
}

/**
 * Branded error page shared by every error boundary / 404 page.
 * Client component — rendered inside the [locale] layout, so next-intl
 * context is always available. Layout-level crashes instead fall through
 * to global-error.tsx (which cannot use next-intl).
 */
export function BrandedErrorPage({
  title,
  message,
  onRetry,
  links = [],
}: {
  title?: string
  message?: string
  onRetry?: () => void
  links?: ErrorLink[]
}) {
  const t = useTranslations()
  const showRetry = typeof onRetry === 'function'

  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center"
    >
      <div className="w-full max-w-md">
        <Logo className="mb-10 justify-center" />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-navy-800">
          <AlertTriangle className="h-7 w-7 text-green-400" aria-hidden="true" />
        </div>

        <h1 className="font-display text-2xl font-bold text-zinc-50">
          {title ?? t('errors.defaultError')}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          {message ?? t('errors.defaultMessage')}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {showRetry && (
            <button onClick={onRetry} className="btn-primary flex-1">
              {t('errors.retry')}
            </button>
          )}
          <Link href="/" className="btn-secondary flex-1">
            <House className="h-4 w-4" aria-hidden="true" />
            {t('common.goHome')}
          </Link>
        </div>

        {links.length > 0 && (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.variant === 'ghost' ? 'btn-ghost flex-1' : 'btn-secondary flex-1'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
