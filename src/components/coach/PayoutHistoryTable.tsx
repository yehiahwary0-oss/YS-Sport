'use client'

import { useTranslations } from 'next-intl'
import { Banknote } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatPrice } from '@/lib/utils'
import type { CoachPayout } from '@/types/payout'
import { PAYOUT_METHODS } from '@/types/payout'
import { PayoutStatusBadge } from './PayoutStatusBadge'

export function PayoutHistoryTable({ payouts }: { payouts: CoachPayout[] }) {
  const t = useTranslations('coach.payouts')

  const methodLabel = (method: string) => {
    if ((PAYOUT_METHODS as readonly string[]).includes(method)) return t(`method_${method}`)
    return method
  }

  if (payouts.length === 0) {
    return <EmptyState icon={Banknote} title={t('noPayouts')} description={t('noPayoutsDesc')} />
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-800 bg-navy-800/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('columnDate')}</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('columnAmount')}</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('columnMethod')}</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('columnStatus')}</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('columnReference')}</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr key={payout.uuid} className="border-b border-zinc-800/50 last:border-0">
              <td className="px-4 py-3 text-zinc-400">{formatDate(payout.requested_at)}</td>
              <td className="px-4 py-3 font-medium text-zinc-100">{formatPrice(payout.amount, payout.currency)}</td>
              <td className="px-4 py-3 capitalize text-zinc-300">{methodLabel(payout.payout_method)}</td>
              <td className="px-4 py-3">
                <PayoutStatusBadge status={payout.status} />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-500">{payout.payout_ref}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PayoutHistoryTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card h-16 animate-pulse" />
      ))}
    </div>
  )
}
