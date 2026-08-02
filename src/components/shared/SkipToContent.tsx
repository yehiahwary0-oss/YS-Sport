'use client'

import { useTranslations } from 'next-intl'

/**
 * Visible-on-focus skip link (WCAG 2.4.1) that jumps keyboard users
 * past the global nav to the main content.
 */
export function SkipToContent() {
  const t = useTranslations('common')

  return (
    <a
      href="#main-content"
      className="sr-only z-[100] rounded bg-green-600 px-4 py-2 text-sm font-medium text-navy-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      {t('skipToContent')}
    </a>
  )
}
