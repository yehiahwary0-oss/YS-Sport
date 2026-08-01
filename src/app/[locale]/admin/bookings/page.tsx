'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Check } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useAdminBookings, useForceCompleteBooking } from '@/hooks/useAdmin'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Booking } from '@/types'

export default function AdminBookingsPage() {
  const t = useTranslations('admin.bookings')
  const tabs = [
    { label: t('tabConfirmed'), value: 'confirmed' },
    { label: t('tabCompleted'), value: 'completed' },
    { label: t('tabCancelled'), value: 'cancelled' },
    { label: t('tabAll'), value: undefined },
  ]
  const [status, setStatus] = useState<string | undefined>('confirmed')
  const { data, isLoading, isError } = useAdminBookings(status)
  const forceComplete = useForceCompleteBooking()

  const [target, setTarget] = useState<Booking | null>(null)
  const [reason, setReason] = useState('')

  const handleForceComplete = () => {
    if (!target) return
    forceComplete.mutate(
      { uuid: target.uuid, reason },
      { onSuccess: () => { setTarget(null); setReason('') } }
    )
  }

  return (
    <div className="space-y-6">
      <SegmentedControl options={tabs} value={status} onChange={setStatus} className="overflow-x-auto" />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((booking) => (
            <div key={booking.uuid} className="card flex items-center gap-4 p-4">
              <Avatar src={booking.athlete?.avatar_path} name={booking.athlete?.display_name ?? '—'} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-100">{booking.athlete?.display_name}</span>
                  <span className="text-zinc-600">→</span>
                  <span className="text-sm text-zinc-300">{booking.coach?.display_name}</span>
                  <Badge status={booking.status}>{booking.status.replace('_', ' ')}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{booking.package?.name} · {formatDate(booking.created_at)}</p>
              </div>
              <div className="font-display font-semibold text-zinc-100">
                {formatPrice(booking.price_amount, booking.price_currency)}
              </div>
              {booking.status === 'confirmed' && (
                <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => setTarget(booking)}>
                  <Check className="h-3 w-3" /> {t('forceComplete')}
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Calendar} title={t('noBookings')} />
      )}

      <Modal open={!!target} onOpenChange={(open) => !open && setTarget(null)} title={t('forceComplete')}>
        <p className="mb-4 text-sm text-zinc-400">{t('forceCompleteDesc')}</p>
        <Textarea
          label={t('reasonLabel')}
          placeholder={t('forceCompletePlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button
          className="mt-5 w-full"
          onClick={handleForceComplete}
          disabled={!reason.trim()}
          isLoading={forceComplete.isPending}
        >
          {t('forceComplete')}
        </Button>
      </Modal>
    </div>
  )
}
