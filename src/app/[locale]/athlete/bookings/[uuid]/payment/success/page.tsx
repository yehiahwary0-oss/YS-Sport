'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useAthleteBookingDetail } from '@/hooks/useBookings'
import { useConfirmPaymentSuccess } from '@/hooks/usePayments'
import { useBookingPayment } from '@/hooks/useBookingPayment'
import { formatPrice } from '@/lib/utils'

export default function PaymentSuccessPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const t = useTranslations('athlete.paymentResult')

  const confirmPayment = useConfirmPaymentSuccess()
  const confirmedRef = useRef(false)

  const { data: booking } = useAthleteBookingDetail(uuid)
  const initialStatus = booking?.payment?.status

  useEffect(() => {
    if (confirmedRef.current) return
    confirmedRef.current = true
    confirmPayment.mutate(uuid)
  }, [uuid, confirmPayment])

  const confirmedStatus = confirmPayment.data?.status
  const poll = useBookingPayment(
    uuid,
    confirmPayment.isSuccess && confirmedStatus === 'pending'
  )
  const finalStatus = poll.data?.payment?.status ?? confirmedStatus

  const payment = confirmPayment.data ?? poll.data?.payment
  const settled = finalStatus && finalStatus !== 'pending'

  if (confirmPayment.isPending || confirmPayment.isIdle) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-400" />
        <h1 className="mt-6 font-display text-xl font-semibold text-zinc-100">{t('confirmingTitle')}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t('confirmingDesc')}</p>
      </div>
    )
  }

  if (confirmPayment.isError) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-400" />
        <h1 className="mt-6 font-display text-xl font-semibold text-zinc-100">{t('errorTitle')}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t('errorDesc')}</p>
        <Link href={`/athlete/bookings/${uuid}`}>
          <Button className="mt-6 w-full">{t('backToBooking')}</Button>
        </Link>
      </div>
    )
  }

  if (settled) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
        <h1 className="mt-6 font-display text-xl font-semibold text-zinc-100">{t('successTitle')}</h1>
        <p className="mt-2 text-sm text-zinc-400">{t('successDesc')}</p>
        {payment && (
          <p className="mt-4 font-display text-2xl font-bold text-green-400">
            {formatPrice(payment.amount, payment.currency)}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Link href={`/athlete/bookings/${uuid}`} className="flex-1">
            <Button className="w-full">{t('backToBooking')}</Button>
          </Link>
          <Link href="/athlete/bookings" className="flex-1">
            <Button variant="secondary" className="w-full">
              {t('viewBookings')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="card mx-auto max-w-md p-8 text-center">
      {poll.timedOut ? (
        <>
          <Clock className="mx-auto h-12 w-12 text-amber-400" />
          <h1 className="mt-6 font-display text-xl font-semibold text-zinc-100">{t('waitingTitle')}</h1>
          <p className="mt-2 text-sm text-zinc-400">{t('stillPending')}</p>
          <Link href={`/athlete/bookings/${uuid}`} className="mt-6 block">
            <Button className="w-full">{t('backToBooking')}</Button>
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-400" />
          <h1 className="mt-6 font-display text-xl font-semibold text-zinc-100">{t('waitingTitle')}</h1>
          <p className="mt-2 text-sm text-zinc-400">{t('waitingDesc')}</p>
          {initialStatus === 'pending' && payment && (
            <p className="mt-4 font-display text-2xl font-bold text-amber-400">
              {formatPrice(payment.amount, payment.currency)}
            </p>
          )}
          <p className="mt-6 text-xs text-zinc-500">{t('autoRefresh')}</p>
        </>
      )}
    </div>
  )
}
