'use client'

import { useTranslations } from 'next-intl'
import { ArrowDownToLine, Clock, DollarSign, Wallet } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { CoachPayoutSummary } from '@/types/payout'

export function EarningsSummaryCard({ summary }: { summary?: CoachPayoutSummary }) {
  const t = useTranslations('coach.payouts')

  const tiles = [
    { key: 'totalEarned', value: summary?.lifetime_earned, icon: DollarSign, color: 'text-zinc-50' },
    { key: 'availableBalance', value: summary?.available_balance, icon: Wallet, color: 'text-green-400' },
    { key: 'pendingAmount', value: summary?.pending_payout, icon: Clock, color: 'text-amber-400' },
    { key: 'totalWithdrawn', value: summary?.withdrawn_total, icon: ArrowDownToLine, color: 'text-zinc-400' },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map(({ key, value, icon: Icon, color }) => (
        <div key={key} className="card p-5">
          <div className="flex items-center gap-2 text-zinc-500">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{t(key)}</span>
          </div>
          <p className={`mt-2 font-display text-2xl font-bold ${color}`}>
            {value !== undefined ? formatPrice(value, summary?.currency) : '—'}
          </p>
        </div>
      ))}
    </div>
  )
}

export function EarningsSummaryCardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card h-24 animate-pulse p-5" />
      ))}
    </div>
  )
}
