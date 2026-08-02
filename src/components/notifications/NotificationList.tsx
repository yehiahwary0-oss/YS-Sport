'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Bell, CheckCheck, X } from 'lucide-react'
import { Link } from '@/navigation'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications'
import { PushNotificationToggle } from '@/components/notifications/PushNotificationToggle'
import { timeAgo, cn } from '@/lib/utils'

const READ_OPTIONS = [
  { value: '', labelKey: 'filterAll' },
  { value: 'false', labelKey: 'filterUnread' },
  { value: 'true', labelKey: 'filterRead' },
] as const

export function NotificationList() {
  const t = useTranslations('notification')
  const [typeFilter, setTypeFilter] = useState('')
  const [readFilter, setReadFilter] = useState('')

  const readParam = readFilter === '' ? undefined : readFilter === 'true'
  const typeParam = typeFilter ? [typeFilter] : undefined

  const { data, isLoading, isError, refetch } = useNotifications({ type: typeParam, read: readParam })
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const hasUnread = data?.data.some((n) => !n.read_at)
  const hasFilters = typeFilter !== '' || readFilter !== ''

  const TYPE_MAP: Record<string, string> = {
    booking_confirmed: 'booking.confirmed',
    booking_cancelled: 'booking.cancelled',
    booking_completed: 'booking.completed',
    booking_reminder: 'booking.reminder',
    request_received: 'service_request.received',
    request_accepted: 'service_request.accepted',
    request_rejected: 'service_request.rejected',
    request_expired: 'service_request.expired',
    payment_required: 'payment.required',
    payment_received: 'payment.received',
    payment_confirmed: 'payment.confirmed',
    payment_refunded: 'payment.refunded',
    new_message: 'message.received',
    coach_verified: 'coach.verified',
    coach_rejected: 'coach.rejected',
    review_received: 'review.received',
    referral_reward_earned: 'referral.reward_earned',
    payout_requested: 'payout.requested',
    payout_approved: 'payout.approved',
    payout_rejected: 'payout.rejected',
    payout_sent: 'payout.sent',
    payout_failed: 'payout.failed',
    achievement_earned: 'achievement.earned',
    level_up: 'progression.level_up',
  }

  const typeOptions = [
    { value: '', label: t('filterAll') },
    ...Object.entries(TYPE_MAP).map(([backendType, i18nKey]) => ({
      value: i18nKey,
      label: t(`types.${backendType}`),
    })),
  ]

  const clearFilters = useCallback(() => {
    setTypeFilter('')
    setReadFilter('')
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PushNotificationToggle />
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1 sm:flex-none">
          <Select
            label={t('filterByType')}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label={t('filterByType')}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex gap-1 rounded-lg bg-navy-800 p-1" role="radiogroup" aria-label={t('filterByStatus')}>
          {READ_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={readFilter === opt.value}
              onClick={() => setReadFilter(opt.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                readFilter === opt.value
                  ? 'bg-green-500 text-navy-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-3.5 w-3.5" /> {t('clearFilters')}
          </Button>
        )}
      </div>

      {hasUnread && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-3.5 w-3.5" /> {t('markAllRead')}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2" aria-label={t('title')}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : data && data.data.length > 0 ? (
        <div className="space-y-2" role="list" aria-label={t('title')}>
          {data.data.map((n) => {
            const content = (
              <div
                role="listitem"
                onClick={() => !n.read_at && markRead.mutate(n.uuid)}
                className={cn(
                  'card cursor-pointer p-4 transition-colors hover:border-zinc-700',
                  !n.read_at && 'border-green-500/30 bg-green-500/5'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{n.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-400">{n.body}</p>
                  </div>
                  {!n.read_at && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" aria-label={t('unreadCount')} />}
                </div>
                <p className="mt-2 text-xs text-zinc-500">{timeAgo(n.created_at)}</p>
              </div>
            )

            return n.action_url ? (
              <Link key={n.uuid} href={n.action_url} aria-label={`${n.title} — ${n.body}`}>{content}</Link>
            ) : (
              <div key={n.uuid}>{content}</div>
            )
          })}
        </div>
      ) : hasFilters ? (
        <EmptyState icon={Bell} title={t('noMatching')} description={t('noMatchingDesc')} />
      ) : (
        <EmptyState icon={Bell} title={t('noNotifications')} description={t('noNotificationsDesc')} />
      )}
    </div>
  )
}
