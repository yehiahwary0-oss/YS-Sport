'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DollarSign, TrendingUp, Clock, Percent } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useEarningsSummary, useCoachPayments } from '@/hooks/useEarnings'
import { formatPrice, formatDate } from '@/lib/utils'

export default function EarningsPage() {
  const t = useTranslations('coach.earnings')
  const [status, setStatus] = useState<string | undefined>(undefined)
  const tabs = [
    { label: t('all'), value: undefined },
    { label: t('paid'), value: 'paid' },
    { label: t('pending'), value: 'pending' },
  ]
  const { data: summary } = useEarningsSummary()
  const { data: payments, isLoading, isError } = useCoachPayments(status)

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('totalEarned')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-zinc-50">
            {summary ? formatPrice(summary.lifetime_earned, summary.currency) : '—'}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('thisMonth')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-green-400">
            {summary ? formatPrice(summary.this_month_earned, summary.currency) : '—'}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('pendingPayouts')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-amber-400">
            {summary ? formatPrice(summary.pending_payout, summary.currency) : '—'}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Percent className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t('platformFees')}</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-zinc-50">
            {summary ? formatPrice(summary.total_commission_paid, summary.currency) : '—'}
          </p>
        </div>
      </div>

      {/* Payments table */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-zinc-100">{t('title')}</h3>
          <SegmentedControl options={tabs} value={status} onChange={setStatus} size="sm" />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : payments && payments.data.length > 0 ? (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-navy-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('date')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('amount')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('yourPayout')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.data.map((payment) => (
                  <tr key={payment.uuid} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-4 py-3 text-zinc-400">{formatDate(payment.created_at)}</td>
                    <td className="px-4 py-3 text-zinc-300">{formatPrice(payment.amount, payment.currency)}</td>
                    <td className="px-4 py-3 font-medium text-zinc-100">{formatPrice(payment.coach_payout, payment.currency)}</td>
                    <td className="px-4 py-3"><Badge status={payment.status}>{t(payment.status)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={DollarSign} title={t('noEarnings')} description={t('noEarningsDesc')} />
        )}
      </div>
    </div>
  )
}
