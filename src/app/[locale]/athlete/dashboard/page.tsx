'use client'

import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Calendar, Send, Heart, ArrowRight } from 'lucide-react'
import { BookingCard, BookingCardSkeleton } from '@/components/shared/BookingCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAthleteBookings } from '@/hooks/useBookings'
import { useAthleteServiceRequests } from '@/hooks/useServiceRequest'
import { useAuthStore } from '@/store/auth.store'

export default function AthleteDashboardPage() {
  const t = useTranslations('athlete.dashboard')
  const user = useAuthStore((s) => s.user)
  const { data: bookings, isLoading: bookingsLoading, isError: bookingsError } = useAthleteBookings('confirmed')
  const { data: pendingRequests } = useAthleteServiceRequests('pending')

  const upcomingBookings = bookings?.data.slice(0, 3) ?? []

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="font-display text-xl font-bold text-zinc-50">{t('title')}</h2>
        <p className="mt-1 text-sm text-zinc-400">{t('subtitle')}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('activeBookings')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-zinc-50">{bookings?.meta.total ?? 0}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Send className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('pendingRequests')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-zinc-50">{pendingRequests?.meta.total ?? 0}</p>
        </div>
        <Link href="/marketplace" className="card flex items-center justify-between p-5 transition-colors hover:border-green-500/50">
          <div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Heart className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{t('findCoach')}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-green-400">{t('browseCoaches')}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-green-400" />
        </Link>
      </div>

      {/* Upcoming bookings */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-zinc-100">{t('upcomingSessions')}</h3>
          <Link href="/athlete/bookings" className="text-sm text-green-400 hover:text-green-400">
            {t('viewBookings')}
          </Link>
        </div>

        {bookingsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => <BookingCardSkeleton key={i} />)}
          </div>
        ) : bookingsError ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.uuid} booking={booking} viewerRole="athlete" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title={t('noUpcoming')}
            description={t('noUpcomingDesc')}
          />
        )}
      </section>
    </div>
  )
}
