'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { EarningsSummaryCard, EarningsSummaryCardSkeleton } from '@/components/coach/EarningsSummaryCard'
import { PayoutHistoryTable, PayoutHistoryTableSkeleton } from '@/components/coach/PayoutHistoryTable'
import { PayoutRequestModal } from '@/components/coach/PayoutRequestModal'
import { useCoachPayouts, useCoachPayoutSummary } from '@/hooks/useCoachPayouts'
import { formatPrice } from '@/lib/utils'
import { MIN_PAYOUT_AMOUNT } from '@/services/payout.service'
import type { PayoutStatus } from '@/types/payout'

const ACTIVE_PAYOUT_STATUSES: PayoutStatus[] = ['pending', 'approved', 'processing']

export default function CoachPayoutsPage() {
  const t = useTranslations('coach.payouts')
  const [modalOpen, setModalOpen] = useState(false)

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useCoachPayoutSummary()

  const {
    data: payouts,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useCoachPayouts()

  const hasPendingPayout = (payouts ?? []).some((p) => ACTIVE_PAYOUT_STATUSES.includes(p.status))
  const canRequest =
    !!summary && summary.available_balance >= MIN_PAYOUT_AMOUNT && !hasPendingPayout

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-50">{t('title')}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t('subtitle')}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button onClick={() => setModalOpen(true)} disabled={!canRequest}>
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {t('requestPayout')}
            </span>
          </Button>
          {!canRequest && (
            <span className="text-xs text-zinc-500">
              {hasPendingPayout ? t('pendingRequestNotice') : t('belowMinimumNotice', { min: formatPrice(MIN_PAYOUT_AMOUNT) })}
            </span>
          )}
        </div>
      </div>

      {summaryLoading ? (
        <EarningsSummaryCardSkeleton />
      ) : summaryError ? (
        <ErrorState onRetry={() => refetchSummary()} />
      ) : (
        <EarningsSummaryCard summary={summary} />
      )}

      <div>
        <h2 className="mb-4 font-display text-base font-semibold text-zinc-100">{t('historyTitle')}</h2>
        {historyLoading ? (
          <PayoutHistoryTableSkeleton />
        ) : historyError ? (
          <ErrorState onRetry={() => refetchHistory()} />
        ) : (
          <PayoutHistoryTable payouts={payouts ?? []} />
        )}
      </div>

      <PayoutRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        availableBalance={summary?.available_balance ?? 0}
        currency={summary?.currency ?? 'USD'}
        hasPendingPayout={hasPendingPayout}
      />
    </div>
  )
}
