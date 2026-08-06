'use client'

import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Inbox, Calendar, DollarSign, Star, ArrowRight, BadgeCheck, Clock, XCircle, ShieldQuestion } from 'lucide-react'
import { ServiceRequestCard, ServiceRequestCardSkeleton } from '@/components/shared/ServiceRequestCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useCoachServiceRequests } from '@/hooks/useServiceRequest'
import { useCoachBookings } from '@/hooks/useBookings'
import { useEarningsSummary } from '@/hooks/useEarnings'
import { useCoachProfileSelf } from '@/hooks/useProfile'
import { formatPrice, formatRating, cn } from '@/lib/utils'
import type { CoachProfile } from '@/types'

export default function CoachDashboardPage() {
  const t = useTranslations('coach.dashboard')
  const { data: profile } = useCoachProfileSelf()
  const { data: pendingRequests, isLoading: requestsLoading, isError: requestsError } = useCoachServiceRequests('pending')
  const { data: confirmedBookings } = useCoachBookings('confirmed')
  const { data: earnings } = useEarningsSummary()

  const status = profile?.verification_status

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold text-zinc-50">{t('title', { name: profile?.display_name ?? '' })}</h2>
        <p className="mt-1 text-sm text-zinc-400">{t('subtitle')}</p>
      </div>

      {/* Verification status badge */}
      {profile && status && (
        <div className={cn(
          'card flex flex-wrap items-center justify-between gap-3 p-4',
          status === 'verified' && 'border-green-500/30',
          status === 'pending' && 'border-amber-400/30',
          status === 'rejected' && 'border-red-500/30'
        )}>
          <div className="flex items-center gap-3">
            {status === 'verified' && <BadgeCheck className="h-5 w-5 text-green-400" />}
            {status === 'pending' && <Clock className="h-5 w-5 text-amber-400" />}
            {status === 'rejected' && <XCircle className="h-5 w-5 text-red-400" />}
            {status === 'unverified' && <ShieldQuestion className="h-5 w-5 text-zinc-400" />}
            <div>
              <p className="text-sm font-medium text-zinc-100">
                {status === 'verified' ? t('verifiedLabel') : status === 'pending' ? t('pendingLabel') : status === 'rejected' ? t('rejectedLabel') : t('unverifiedLabel')}
              </p>
              <p className="text-xs text-zinc-500">
                {status === 'verified' ? t('verifiedHint') : status === 'pending' ? t('pendingHint') : status === 'rejected' ? t('rejectedHint') : t('unverifiedHint')}
              </p>
              {status === 'rejected' && profile.rejection_reason && (
                <p className="mt-1 text-xs text-red-400">
                  {t('rejectionReason')}: {profile.rejection_reason}
                </p>
              )}
            </div>
          </div>
          {(status === 'rejected' || status === 'unverified') && (
            <Link href="/coach/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400 hover:text-green-300">
              {status === 'rejected' ? t('resubmit') : t('getVerified')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {/* Profile completion banner */}
      {profile && profile.profile_completion < 100 && (
        <Link href="/coach/profile" className="card flex items-center justify-between p-4 transition-colors hover:border-green-500/50">
          <div>
            <p className="text-sm font-medium text-zinc-200">{t('profileCompletion', { percent: profile.profile_completion })}</p>
            <p className="text-xs text-zinc-500">{t('profileCompletionDesc')}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-green-400" />
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Inbox className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('pendingRequests')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-zinc-50">{pendingRequests?.meta.total ?? 0}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('activeBookings')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-zinc-50">{confirmedBookings?.meta.total ?? 0}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('totalEarnings')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-zinc-50">
            {earnings ? formatPrice(earnings.this_month_earned, earnings.currency) : '—'}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Star className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('rating')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-zinc-50">{formatRating(profile?.avg_rating ?? null)}</p>
        </div>
      </div>

      {/* Pending requests */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-zinc-100">{t('pendingRequests')}</h3>
          <Link href="/coach/requests" className="text-sm text-green-400 hover:text-green-400">
            {t('viewRequests')}
          </Link>
        </div>

        {requestsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => <ServiceRequestCardSkeleton key={i} />)}
          </div>
        ) : requestsError ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : pendingRequests && pendingRequests.data.length > 0 ? (
          <div className="space-y-3">
            {pendingRequests.data.slice(0, 5).map((req) => (
              <ServiceRequestCard key={req.uuid} request={req} viewerRole="coach" />
            ))}
          </div>
        ) : (
          <EmptyState icon={Inbox} title={t('noPendingRequests')} description={t('noPendingRequestsDesc')} />
        )}
      </section>
    </div>
  )
}
