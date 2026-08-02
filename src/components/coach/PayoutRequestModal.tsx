'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useRequestPayout } from '@/hooks/useCoachPayouts'
import { MIN_PAYOUT_AMOUNT } from '@/services/payout.service'
import { formatPrice } from '@/lib/utils'
import { PAYOUT_METHODS } from '@/types/payout'

interface PayoutRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableBalance: number
  currency: string
  hasPendingPayout: boolean
}

export function PayoutRequestModal({
  open,
  onOpenChange,
  availableBalance,
  currency,
  hasPendingPayout,
}: PayoutRequestModalProps) {
  const t = useTranslations('coach.payouts')
  const requestPayout = useRequestPayout()

  const [amount, setAmount] = useState('')
  const [payoutMethod, setPayoutMethod] = useState('')
  const [payoutReference, setPayoutReference] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const reset = () => {
    setAmount('')
    setPayoutMethod('')
    setPayoutReference('')
    setErrors({})
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    const value = Number(amount)

    if (!amount || Number.isNaN(value) || value <= 0) {
      next.amount = t('amountRequired')
    } else if (value < MIN_PAYOUT_AMOUNT) {
      next.amount = t('amountMin', { min: formatPrice(MIN_PAYOUT_AMOUNT, currency) })
    } else if (value > availableBalance) {
      next.amount = t('amountMax', { max: formatPrice(availableBalance, currency) })
    }

    if (!payoutMethod) {
      next.payoutMethod = t('methodRequired')
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (hasPendingPayout || !validate()) return

    requestPayout.mutate(
      {
        amount: Number(amount),
        payout_method: payoutMethod,
        payout_reference: payoutReference.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      }
    )
  }

  const blockedByPending = hasPendingPayout
  const belowMinimum = availableBalance < MIN_PAYOUT_AMOUNT

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
      title={t('requestTitle')}
      description={t('requestDescription', { balance: formatPrice(availableBalance, currency) })}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {blockedByPending && (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
            {t('pendingBlocked')}
          </p>
        )}

        <Input
          name="amount"
          label={t('amountLabel')}
          type="number"
          min={MIN_PAYOUT_AMOUNT}
          step="0.01"
          placeholder={t('amountPlaceholder')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          hint={t('amountMinHint', { min: formatPrice(MIN_PAYOUT_AMOUNT, currency) })}
          disabled={blockedByPending}
        />

        <Select
          name="payout_method"
          label={t('methodLabel')}
          value={payoutMethod}
          onChange={(e) => setPayoutMethod(e.target.value)}
          error={errors.payoutMethod}
          disabled={blockedByPending}
        >
          <option value="">{t('methodPlaceholder')}</option>
          {PAYOUT_METHODS.map((method) => (
            <option key={method} value={method}>
              {t(`method_${method}`)}
            </option>
          ))}
        </Select>

        <Textarea
          name="payout_reference"
          label={t('referenceLabel')}
          placeholder={t('referencePlaceholder')}
          value={payoutReference}
          onChange={(e) => setPayoutReference(e.target.value)}
          disabled={blockedByPending}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button type="submit" isLoading={requestPayout.isPending} disabled={blockedByPending || belowMinimum}>
            {t('submit')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
