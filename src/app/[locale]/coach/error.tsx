'use client'

import { BrandedErrorPage } from '@/components/shared/BrandedErrorPage'
import { useTranslations } from 'next-intl'

/**
 * Coach-group error boundary — extends the branded page with a shortcut
 * back to the coach dashboard.
 */
export default function CoachError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('coach.nav')

  return (
    <BrandedErrorPage
      onRetry={reset}
      links={[{ label: t('dashboard'), href: '/coach/dashboard' }]}
    />
  )
}
