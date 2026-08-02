'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DollarSign, Check } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { FilterBar } from '@/components/admin/FilterBar'
import { PaginationControls } from '@/components/admin/PaginationControls'
import { useAdminPayments, useConfirmPayment, useRefundPayment } from '@/hooks/useAdmin'
import { formatPrice, formatDate } from '@/lib/utils'
import { exportToCsv, timestampedFilename } from '@/utils/csvExport'
import type { Payment } from '@/types'

export default function AdminPaymentsPage() {
  const t = useTranslations('admin.payments')
  const tc = useTranslations('common')
  const [status, setStatus] = useState<string | undefined>('pending')
  const [method, setMethod] = useState('')
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const tabs = [
    { label: t('pendingTitle'), value: 'pending' },
    { label: t('paidTitle'), value: 'paid' },
    { label: t('allStatus'), value: undefined },
  ]
  const { data, isLoading, isError } = useAdminPayments({
    status,
    method: method || undefined,
    date_from: dateFrom,
    date_to: dateTo,
    page,
  })
  const confirmPayment = useConfirmPayment()
  const refundPayment = useRefundPayment()

  const [confirmTarget, setConfirmTarget] = useState<Payment | null>(null)
  const [externalRef, setExternalRef] = useState('')
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null)
  const [refundReason, setRefundReason] = useState('')

  const handleConfirm = () => {
    if (!confirmTarget) return
    confirmPayment.mutate(
      { uuid: confirmTarget.uuid, externalReference: externalRef || undefined },
      { onSuccess: () => { setConfirmTarget(null); setExternalRef('') } }
    )
  }

  const handleRefund = () => {
    if (!refundTarget) return
    refundPayment.mutate(
      { uuid: refundTarget.uuid, reason: refundReason },
      { onSuccess: () => { setRefundTarget(null); setRefundReason('') } }
    )
  }

  const handleReset = () => {
    setMethod('')
    setDateFrom(undefined)
    setDateTo(undefined)
    setPage(1)
  }

  const handleExport = () => {
    if (!data) return
    exportToCsv<Payment>(
      timestampedFilename('payments'),
      data.data,
      [
        { key: 'uuid', header: 'Payment ID', value: (p) => p.uuid },
        { key: 'amount', header: 'Amount', value: (p) => p.amount },
        { key: 'currency', header: 'Currency', value: (p) => p.currency },
        { key: 'status', header: 'Status', value: (p) => p.status },
        { key: 'payment_method', header: 'Method', value: (p) => p.payment_method ?? '' },
        { key: 'created_at', header: 'Created', value: (p) => p.created_at },
      ]
    )
  }

  return (
    <div className="space-y-6">
      <SegmentedControl
        options={tabs}
        value={status}
        onChange={(v) => { setStatus(v); setPage(1) }}
      />

      <FilterBar
        options={[
          {
            name: 'method',
            label: t('method'),
            value: method,
            onChange: (v) => { setMethod(v); setPage(1) },
            options: [
              { value: '', label: t('allMethods') },
              { value: 'bank_transfer', label: t('methodBankTransfer') },
              { value: 'card', label: t('methodCard') },
              { value: 'cash', label: t('methodCash') },
              { value: 'processor', label: t('methodProcessor') },
            ],
          },
        ]}
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
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.data.map((payment) => (
              <div key={payment.uuid} className="card flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-100">{formatPrice(payment.amount, payment.currency)}</span>
                    <Badge status={payment.status}>{payment.status === 'pending' ? t('statusPending') : payment.status === 'paid' ? t('statusPaid') : t('statusRefunded')}</Badge>
                  </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {t('coachPayout', { amount: formatPrice(payment.coach_payout, payment.currency), date: formatDate(payment.created_at) })}
                    </p>
                </div>

                {payment.status === 'pending' && (
                  <Button size="sm" className="gap-1.5" onClick={() => setConfirmTarget(payment)}>
                    <Check className="h-3.5 w-3.5" /> {t('confirmButton')}
                  </Button>
                )}
                {payment.status === 'paid' && (
                  <Button size="sm" variant="secondary" onClick={() => setRefundTarget(payment)}>
                    {t('refundButton')}
                  </Button>
                )}
              </div>
            ))}
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
        <EmptyState icon={DollarSign} title={t('noPayments')} description={t('noPaymentsDesc')} />
      )}

      <Modal open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)} title={t('confirmButton')}>
        <p className="mb-4 text-sm text-zinc-400">
          {t('confirmDesc', { amount: confirmTarget ? formatPrice(confirmTarget.amount, confirmTarget.currency) : '' })}
        </p>
        <Input
          label={t('externalRef')}
          placeholder={t('externalRefPlaceholder')}
          value={externalRef}
          onChange={(e) => setExternalRef(e.target.value)}
        />
        <Button className="mt-5 w-full" onClick={handleConfirm} isLoading={confirmPayment.isPending}>
          {t('confirmButton')}
        </Button>
      </Modal>

      <Modal open={!!refundTarget} onOpenChange={(open) => !open && setRefundTarget(null)} title={t('refundButton')}>
        <Textarea
          label={t('reasonLabel')}
          placeholder={t('refundPlaceholder')}
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
        />
        <Button
          variant="danger"
          className="mt-5 w-full"
          onClick={handleRefund}
          disabled={!refundReason.trim()}
          isLoading={refundPayment.isPending}
        >
          {t('refundButton')}
        </Button>
      </Modal>
    </div>
  )
}
