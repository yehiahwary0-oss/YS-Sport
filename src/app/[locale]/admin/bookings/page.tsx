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
import { FilterBar } from '@/components/admin/FilterBar'
import { PaginationControls } from '@/components/admin/PaginationControls'
import { useAdminBookings, useForceCompleteBooking } from '@/hooks/useAdmin'
import { formatPrice, formatDate } from '@/lib/utils'
import { exportToCsv, timestampedFilename } from '@/utils/csvExport'
import type { Booking } from '@/types'

export default function AdminBookingsPage() {
  const t = useTranslations('admin.bookings')
  const tc = useTranslations('common')
  const tabs = [
    { label: t('tabConfirmed'), value: 'confirmed' },
    { label: t('tabCompleted'), value: 'completed' },
    { label: t('tabCancelled'), value: 'cancelled' },
    { label: t('tabAll'), value: undefined },
  ]
  const [status, setStatus] = useState<string | undefined>('confirmed')
  const [coach, setCoach] = useState('')
  const [athlete, setAthlete] = useState('')
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useAdminBookings({
    status,
    coach: coach || undefined,
    athlete: athlete || undefined,
    date_from: dateFrom,
    date_to: dateTo,
    page,
  })
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

  const handleReset = () => {
    setCoach('')
    setAthlete('')
    setDateFrom(undefined)
    setDateTo(undefined)
    setPage(1)
  }

  const handleExport = () => {
    if (!data) return
    exportToCsv<Booking>(
      timestampedFilename('bookings'),
      data.data,
      [
        { key: 'uuid', header: 'Booking ID', value: (b) => b.uuid },
        { key: 'athlete', header: 'Athlete', value: (b) => b.athlete?.display_name ?? '' },
        { key: 'coach', header: 'Coach', value: (b) => b.coach?.display_name ?? '' },
        { key: 'status', header: 'Status', value: (b) => b.status },
        { key: 'price_amount', header: 'Price', value: (b) => b.price_amount },
        { key: 'price_currency', header: 'Currency', value: (b) => b.price_currency },
        { key: 'created_at', header: 'Created', value: (b) => b.created_at },
      ]
    )
  }

  return (
    <div className="space-y-6">
      <SegmentedControl
        options={tabs}
        value={status}
        onChange={(v) => { setStatus(v); setPage(1) }}
        className="overflow-x-auto"
      />

      <FilterBar
        search={coach}
        onSearchChange={(v) => { setCoach(v); setPage(1) }}
        searchPlaceholder={t('searchCoach')}
        secondarySearch={athlete}
        onSecondarySearchChange={(v) => { setAthlete(v); setPage(1) }}
        secondarySearchPlaceholder={t('searchAthlete')}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(d) => { setDateFrom(d.dateFrom); setDateTo(d.dateTo); setPage(1) }}
        onReset={handleReset}
        resetLabel={tc('reset')}
        onExport={handleExport}
        exportLabel={t('exportCsv')}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <>
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
          <PaginationControls
            meta={data.meta}
            onPageChange={setPage}
            ariaLabel={t('paginationLabel')}
            pageLabel={(p) => t('pageLabel', { page: p })}
            previousLabel={tc('previous')}
            nextLabel={tc('next')}
          />
        </>
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
