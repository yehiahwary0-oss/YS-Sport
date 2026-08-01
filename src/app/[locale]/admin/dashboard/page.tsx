'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { Users, ShieldCheck, Calendar, DollarSign, ArrowRight, TrendingUp } from 'lucide-react'
import { useAdminMetrics } from '@/hooks/useAdmin'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatPrice } from '@/lib/utils'

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard')
  const { data: metrics, isLoading, isError } = useAdminMetrics()

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Users} label={t('usersNew7d')} value={metrics.users.new_7d} />
          <StatCard icon={TrendingUp} label={t('usersNew30d')} value={metrics.users.new_30d} />
          <StatCard icon={Users} label={t('totalUsers')} value={metrics.users.total} />
        </div>
      </section>

      {/* Coaches */}
      <section>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('coaches')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/admin/coaches">
            <StatCard
              icon={ShieldCheck}
              label={t('pendingVerifications')}
              value={metrics.coaches.pending_verification}
              highlight={metrics.coaches.pending_verification > 0}
              action
            />
          </Link>
          <StatCard icon={ShieldCheck} label={t('totalCoaches')} value={metrics.coaches.verified} />
        </div>
      </section>

      {/* Bookings */}
      <section>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('bookings')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Calendar} label={t('activeBookings')} value={metrics.bookings.active} />
          <StatCard icon={Calendar} label={t('completedTotal')} value={metrics.bookings.completed_total} />
          <StatCard icon={TrendingUp} label={t('completionRate')} value={metrics.bookings.completion_rate} />
        </div>
      </section>

      {/* Revenue */}
      <section>
        <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('revenue')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard icon={DollarSign} label={t('thisMonth')} value={formatPrice(metrics.revenue.this_month)} />
          <Link href="/admin/payments">
            <StatCard
              icon={DollarSign}
              label={t('pendingConfirmation')}
              value={formatPrice(metrics.revenue.pending)}
              highlight={Number(metrics.revenue.pending) > 0}
              action
            />
          </Link>
        </div>
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
  action,
}: {
  icon: typeof Users
  label: string
  value: string | number
  highlight?: boolean
  action?: boolean
}) {
  return (
    <div className={`card flex items-center justify-between p-5 ${highlight ? 'border-amber-500/40 bg-amber-500/5' : ''}`}>
      <div>
        <div className="flex items-center gap-2 text-zinc-500">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className="mt-2 font-display text-2xl font-bold text-zinc-50">{value}</p>
      </div>
      {action && <ArrowRight className="h-4 w-4 text-zinc-500" />}
    </div>
  )
}
