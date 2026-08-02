'use client'

import { useTranslations } from 'next-intl'
import { BellRing, BellOff } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { cn } from '@/lib/utils'

/**
 * Web Push enable/disable switch. Auto-subscribes when the user logs in
 * with permission already granted; this switch is the explicit opt-out.
 */
export function PushNotificationToggle() {
  const t = useTranslations('notification.push')
  const { supported, isEnabled, loading, enable, disable } = usePushNotifications()

  if (!supported) return null

  const toggle = () => {
    if (isEnabled) {
      disable()
    } else {
      enable()
    }
  }

  const label = isEnabled ? t('enabled') : t('disabled')
  const description = isEnabled ? t('enabledDesc') : t('disabledDesc')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEnabled}
      onClick={toggle}
      disabled={loading}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-start transition',
        isEnabled
          ? 'border-emerald-500/30 bg-emerald-500/10'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            isEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
          )}
        >
          {isEnabled ? <BellRing className="h-4 w-4" aria-hidden="true" /> : <BellOff className="h-4 w-4" aria-hidden="true" />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-zinc-100">{label}</span>
          <span className="block truncate text-xs text-zinc-400">{description}</span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          isEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            isEnabled ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'
          )}
        />
      </span>
    </button>
  )
}
