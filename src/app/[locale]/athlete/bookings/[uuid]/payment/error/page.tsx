'use client'

import { useParams } from 'next/navigation'
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'
import { XCircle } from 'lucide-react'

import { Button } from '@/components/ui/Button'

export default function PaymentErrorPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const t = useTranslations('athlete.paymentResult')

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
