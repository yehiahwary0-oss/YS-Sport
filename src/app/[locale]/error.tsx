'use client'

import { useEffect } from 'react'
import { BrandedErrorPage } from '@/components/shared/BrandedErrorPage'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface unexpected errors to monitoring (Sentry is installed).
    console.error(error)
  }, [error])

  return <BrandedErrorPage onRetry={reset} />
}
