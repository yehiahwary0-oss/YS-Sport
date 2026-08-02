'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Ban } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useConfirmPaymentCancelled } from '@/hooks/usePayments'

export default function PaymentCancelledPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const t = useTranslations('athlete.paymentResult')

  const confirmCancelled = useConfirmPaymentCancelled()
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (cancelledRef.current) return
    cancelledRef.current = true
    confirmCancelled.mutate(uuid)
  }, [uuid, confirmCancelled])

  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      <Ban className="mx-auto h-12 w-12 text-zinc-400" />
      <h1 className="mt-6 font-display text-xl font-semibold text-zinc-100">{t('cancelledTitle')}</h1>
      <p className="mt-2 text-sm text-zinc-400">{t('cancelledDesc')}</p>
      <Link href={`/athlete/bookings/${uuid}`}>
        <Button className="mt-6 w-full">{t('backToBooking')}</Button>
      </Link>
    </div>
  )
}
