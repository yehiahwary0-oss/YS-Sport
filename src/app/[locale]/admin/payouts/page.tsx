'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Banknote } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { FilterBar } from '@/components/admin/FilterBar'
import { PaginationControls } from '@/components/admin/PaginationControls'
import { useAdminPayouts } from '@/hooks/useAdmin'
import { formatPrice, formatDate } from '@/lib/utils'
import { exportToCsv, timestampedFilename } from '@/utils/csvExport'
import type { AdminPayout } from '@/services/admin.service'

export default function AdminPayoutsPage() {
  const t = useTranslations('admin.payouts')
  const tc = useTranslations('common')
  const [status, setStatus] = useState<string | undefined>('pending')
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useAdminPayouts({
    status,
    date_from: dateFrom,
    date_to: dateTo,
    page,
  })

  const handleReset = () => {
    setDateFrom(undefined)
    setDateTo(undefined)
    setPage(1)
  }

  const handleExport = () => {
    if (!data) return
    exportToCsv<AdminPayout>(
      timestampedFilename('payouts'),
      data.data,
      [
        { key: 'uuid', header: 'Payout ID', value: (p) => p.uuid },
        { key: 'coach', header: 'Coach', value: (p) => p.coach?.display_name ?? '' },
        { key: 'amount', header: 'Amount', value: (p) => p.amount },
        { key: 'currency', header: 'Currency', value: (p) => p.currency },
        { key: 'status', header: 'Status', value: (p) => p.status },
        { key: 'payout_method', header: 'Method', value: (p) => p.payout_method ?? '' },
        { key: 'requested_at', header: 'Requested', value: (p) => p.requested_at ?? '' },
      ]
    )
  }

  return (
    <div className="space-y-6">
      <SegmentedControl
        options={[
          { label: t('tabPending'), value: 'pending' },
          { label: t('tabProcessing'), value: 'processing' },
          { label: t('tabSent'), value: 'sent' },
          { label: t('tabAll'), value: undefined },
        ]}
        value={status}
        onChange={(v) => { setStatus(v); setPage(1) }}
        className="overflow-x-auto"
      />

      <FilterBar
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
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-800 bg-navy-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('coach')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('amount')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('status')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('method')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('requested')}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((payout) => (
                  <tr key={payout.uuid} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-4 py-3 text-zinc-300">{payout.coach?.display_name ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-zinc-100">{formatPrice(payout.amount, payout.currency)}</td>
                    <td className="px-4 py-3"><Badge status={payout.status}>{payout.status}</Badge></td>
                    <td className="px-4 py-3 text-zinc-400">{payout.payout_method ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">{payout.requested_at ? formatDate(payout.requested_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <EmptyState icon={Banknote} title={t('noPayouts')} description={t('noPayoutsDesc')} />
      )}
    </div>
  )
}
