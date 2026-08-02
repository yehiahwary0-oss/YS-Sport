'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { WifiOff } from 'lucide-react'

/**
 * Slim banner pinned to the top when the device goes offline.
 * Uses navigator.onLine + window events (also covered by the SW's
 * network-first fallback, but the banner gives instant feedback).
 */
export function OfflineBanner() {
  const t = useTranslations('common')
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setIsOffline(!navigator.onLine)

    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-sm font-medium text-amber-950"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>{t('offline')}</span>
    </div>
  )
}
