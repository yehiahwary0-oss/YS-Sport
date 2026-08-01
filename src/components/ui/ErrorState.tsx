'use client'

import { useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title,
  message,
  onRetry,
}: ErrorStateProps) {
  const t = useTranslations('errors')
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/20 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-zinc-200">{title ?? t('defaultError')}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-zinc-500">{message ?? t('defaultMessage')}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onRetry}>
            {t('retry')}
          </Button>
        </div>
      )}
    </div>
  )
}
