'use client'

import { useTranslations } from 'next-intl'
import { CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAthletePayments } from '@/hooks/usePayments'
import { formatPrice, formatDate } from '@/lib/utils'

export default function AthletePaymentsPage() {
  const t = useTranslations('athlete.payments')
  const ts = useTranslations('booking.paymentStatus')
  const { data, isLoading, isError } = useAthletePayments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-zinc-100">{t('title')}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t('subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-navy-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('date')}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('amount')}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('method')}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('reference')}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((payment) => (
                <tr key={payment.uuid} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-4 py-3 text-zinc-400">{formatDate(payment.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    {formatPrice(payment.amount, payment.currency)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{payment.payment_method.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {payment.external_reference ? (
                      <span className="font-mono text-xs">{payment.external_reference.slice(0, 16)}...</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge status={payment.status}>{ts(payment.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={CreditCard} title={t('noPayments')} description={t('noPaymentsDesc')} />
      )}
    </div>
  )
}
