'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar } from 'lucide-react'
import { BookingCard, BookingCardSkeleton } from '@/components/shared/BookingCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAthleteBookings } from '@/hooks/useBookings'
import { cn } from '@/lib/utils'

export default function AthleteBookingsPage() {
  const t = useTranslations('athlete.bookings')
  const [status, setStatus] = useState<string | undefined>(undefined)
  const tabs = [
    { label: t('all'), value: undefined },
    { label: t('confirmed'), value: 'confirmed' },
    { label: t('completed'), value: 'completed' },
    { label: t('cancelled'), value: 'cancelled' },
  ]
  const { data, isLoading, isError } = useAthleteBookings(status)

  return (
    <div className="space-y-6">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-navy-800 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setStatus(tab.value)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              status === tab.value ? 'bg-green-500 text-navy-900' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <BookingCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((booking) => (
            <BookingCard key={booking.uuid} booking={booking} viewerRole="athlete" />
          ))}
        </div>
      ) : (
        <EmptyState icon={Calendar} title={t('noBookings')} description={t('noBookingsDesc')} />
      )}
    </div>
  )
}
