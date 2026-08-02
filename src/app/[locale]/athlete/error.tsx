'use client'

import { BrandedErrorPage } from '@/components/shared/BrandedErrorPage'
import { useTranslations } from 'next-intl'

/**
 * Athlete-group error boundary — extends the branded page with a shortcut
 * back to the athlete dashboard.
 */
export default function AthleteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('athlete.nav')

  return (
    <BrandedErrorPage
      onRetry={reset}
      links={[{ label: t('dashboard'), href: '/athlete/dashboard' }]}
    />
  )
}
