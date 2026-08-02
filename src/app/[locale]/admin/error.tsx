'use client'

import { BrandedErrorPage } from '@/components/shared/BrandedErrorPage'
import { useTranslations } from 'next-intl'

/**
 * Admin-group error boundary — extends the branded page with a shortcut
 * back to the admin dashboard.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('admin.nav')

  return (
    <BrandedErrorPage
      onRetry={reset}
      links={[{ label: t('dashboard'), href: '/admin/dashboard' }]}
    />
  )
}
