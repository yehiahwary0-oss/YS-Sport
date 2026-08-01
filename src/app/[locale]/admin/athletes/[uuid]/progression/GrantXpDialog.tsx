'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Medal } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useGrantXp } from '@/hooks/useAdmin'

interface GrantXpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  athleteUuid: string
  athleteName: string
  sportOptions: { id: number; name: string }[]
}

type Step = 'form' | 'confirm'

export function GrantXpDialog({ open, onOpenChange, athleteUuid, athleteName, sportOptions }: GrantXpDialogProps) {
  const t = useTranslations('admin.athletes')
  const tc = useTranslations('common')
  const { mutate, isPending } = useGrantXp(athleteUuid)

  const [step, setStep] = useState<Step>('form')
  const [sportId, setSportId] = useState(sportOptions[0]?.id ?? 0)
  const [xpAmount, setXpAmount] = useState('')
  const [reason, setReason] = useState('')
  const [xpError, setXpError] = useState('')
  const [error, setError] = useState('')

  function resetForm() {
    setStep('form')
    setSportId(sportOptions[0]?.id ?? 0)
    setXpAmount('')
    setReason('')
    setXpError('')
    setError('')
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm()
    onOpenChange(open)
  }

  function handleNext() {
    const amount = parseInt(xpAmount, 10)
    if (!xpAmount.trim() || isNaN(amount) || amount < 1) {
      setXpError(t('xpAmountInvalid'))
      return
    }
    setXpError('')
    setError('')
    setStep('confirm')
  }

  function handleConfirm() {
    setError('')
    mutate(
      { sport_id: sportId, xp_amount: parseInt(xpAmount, 10), reason: reason.trim() || undefined },
      {
        onSuccess: (data) => {
          if (data.status === 'already_processed') {
            setError(t('grantXpAlreadyProcessed'))
          } else {
            handleOpenChange(false)
          }
        },
        onError: () => {
          setError(t('grantXpError'))
        },
      }
    )
  }

  const selectedSport = sportOptions.find(s => s.id === sportId)

  function handleFormKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange} title={t('grantXpTitle', { name: athleteName })} description={t('grantXpDesc')}>
      {step === 'form' ? (
        <div className="space-y-4" onKeyDown={handleFormKeyDown}>
          <div>
            <label htmlFor="sport-select" className="label-text">{t('sportSummary', { sport: '' }).split(':')[0]}</label>
            <select
              id="sport-select"
              value={sportId}
              onChange={(e) => setSportId(Number(e.target.value))}
              className="input-base mt-1"
            >
              {sportOptions.map((sport) => (
                <option key={sport.id} value={sport.id}>{sport.name}</option>
              ))}
            </select>
          </div>

          <Input
            name="xpAmount"
            type="number"
            min={1}
            label={t('xpAmountLabel')}
            placeholder={t('xpAmountPlaceholder')}
            value={xpAmount}
            onChange={(e) => { setXpAmount(e.target.value); setXpError('') }}
            error={xpError}
          />

          <Textarea
            name="reason"
            label={t('reasonLabel')}
            placeholder={t('reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {error && <p className="error-text" role="alert">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>{tc('cancel')}</Button>
            <Button onClick={handleNext}>{tc('next')}</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-navy-700/50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10">
                <Medal className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="font-medium text-zinc-200">{t('grantingTo', { amount: xpAmount, name: athleteName })}</p>
                <p className="text-xs text-zinc-500">{t('xpAmountSummary', { amount: xpAmount })}</p>
                {selectedSport && <p className="text-xs text-zinc-500">{t('sportSummary', { sport: selectedSport.name })}</p>}
                {reason.trim() && <p className="text-xs text-zinc-500">{t('reasonSummary', { reason })}</p>}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-400 space-y-1">
            <p>{t('permanentLedgerEvent')}</p>
            <p>{t('levelUpNote')}</p>
          </div>

          {error && <p className="error-text" role="alert">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" disabled={isPending} onClick={() => setStep('form')}>
              {tc('back')}
            </Button>
            <Button isLoading={isPending} disabled={isPending} onClick={handleConfirm}>
              {isPending ? t('grantingXp') : t('grantXpConfirm')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
