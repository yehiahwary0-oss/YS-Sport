'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { Users, ShieldCheck, Calendar, DollarSign, Banknote } from 'lucide-react'
import { useAdminMetrics, useAdminAuditLogs } from '@/hooks/useAdmin'
import { ErrorState } from '@/components/ui/ErrorState'
import { MetricCard } from '@/components/admin/MetricCard'
import { ActivityFeed } from '@/components/admin/ActivityFeed'
import { formatPrice } from '@/lib/utils'

function delta(thisMonth: number | string, lastMonth: number | string): number | null {
  const current = Number(thisMonth)
  const previous = Number(lastMonth)
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard')
  const { data: metrics, isLoading, isError } = useAdminMetrics()
  const { data: activity } = useAdminAuditLogs(10)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
      </div>
    )
  }

  if (isError || !metrics) return <ErrorState onRetry={() => window.location.reload()} />

  return (
    <div className="space-y-8">
      {/* Users */}
      <section>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('users')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Users} label={t('totalUsers')} value={metrics.users.total} />
          <MetricCard
            icon={Users}
            label={t('usersThisMonth')}
            value={metrics.users.this_month}
            delta={delta(metrics.users.this_month, metrics.users.last_month)}
            deltaLabel={t('vsLastMonth')}
          />
          <MetricCard icon={Users} label={t('usersNew7d')} value={metrics.users.new_7d} />
          <MetricCard icon={Users} label={t('usersNew30d')} value={metrics.users.new_30d} />
        </div>
      </section>

      {/* Coaches */}
      <section>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('coaches')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/coaches">
            <MetricCard
              icon={ShieldCheck}
              label={t('pendingVerifications')}
              value={metrics.coaches.pending_verification}
              highlight={metrics.coaches.pending_verification > 0}
              action
            />
          </Link>
          <MetricCard icon={ShieldCheck} label={t('totalCoaches')} value={metrics.coaches.total} />
          <MetricCard icon={ShieldCheck} label={t('verifiedCoaches')} value={metrics.coaches.verified} />
        </div>
      </section>

      {/* Bookings */}
      <section>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('bookings')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Calendar}
            label={t('bookingsThisMonth')}
            value={metrics.bookings.this_month}
            delta={delta(metrics.bookings.this_month, metrics.bookings.last_month)}
            deltaLabel={t('vsLastMonth')}
          />
          <MetricCard icon={Calendar} label={t('activeBookings')} value={metrics.bookings.active} />
          <MetricCard icon={Calendar} label={t('completedTotal')} value={metrics.bookings.completed_total} />
          <MetricCard icon={Calendar} label={t('completionRate')} value={metrics.bookings.completion_rate} />
        </div>
      </section>

      {/* Revenue & Payouts */}
      <section>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('revenue')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={DollarSign}
            label={t('thisMonth')}
            value={formatPrice(metrics.revenue.this_month)}
            delta={delta(metrics.revenue.this_month, metrics.revenue.last_month)}
            deltaLabel={t('vsLastMonth')}
          />
          <MetricCard icon={DollarSign} label={t('lastMonth')} value={formatPrice(metrics.revenue.last_month)} />
          <Link href="/admin/payments">
            <MetricCard
              icon={DollarSign}
              label={t('pendingConfirmation')}
              value={formatPrice(metrics.revenue.pending)}
              highlight={Number(metrics.revenue.pending) > 0}
              action
            />
          </Link>
          <Link href="/admin/payouts">
            <MetricCard
              icon={Banknote}
              label={t('pendingPayouts')}
              value={metrics.payouts.pending}
              highlight={metrics.payouts.pending > 0}
              action
            />
          </Link>
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <ActivityFeed items={activity ?? []} title={t('recentActivity')} />
      </section>
    </div>
  )
}
