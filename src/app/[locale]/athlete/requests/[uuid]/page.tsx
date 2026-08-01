'use client'

import { useParams } from 'next/navigation'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Clock, X } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { useServiceRequestDetail, useCancelServiceRequest } from '@/hooks/useServiceRequest'
import { formatPrice, formatDateTime, timeAgo } from '@/lib/utils'

export default function AthleteRequestDetailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const router = useRouter()
  const t = useTranslations('athlete.requests')
  const ts = useTranslations('booking.serviceRequestStatus')
  const { data: request, isLoading, isError } = useServiceRequestDetail(uuid, 'athlete')
  const cancelRequest = useCancelServiceRequest()

  if (isLoading) return <FullPageSpinner />
  if (isError) return <ErrorState onRetry={() => window.location.reload()} />
  if (!request) return <EmptyState icon={X} title={t('notFound')} description={t('notFoundDesc')} />

  const handleCancel = () => {
    cancelRequest.mutate(request.uuid, {
      onSuccess: () => router.push('/athlete/requests'),
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={request.coach?.avatar_path} name={request.coach?.display_name ?? '—'} size="lg" />
            <div>
              <h2 className="font-display text-lg font-semibold text-zinc-100">{request.coach?.display_name}</h2>
              <p className="text-sm text-zinc-500">{request.package_name}</p>
            </div>
          </div>
          <Badge status={request.status}>{ts(request.status)}</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-5">
          <div>
            <span className="text-xs text-zinc-500">{t('price')}</span>
            <p className="font-display font-semibold text-zinc-100">{formatPrice(request.price_amount, request.price_currency)}</p>
          </div>
          <div>
            <span className="text-xs text-zinc-500">{t('sent')}</span>
            <p className="text-sm text-zinc-300">{timeAgo(request.created_at)}</p>
          </div>
        </div>

        {request.status === 'pending' && (
          <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-400">
            <Clock className="h-4 w-4" /> {t('expires', { time: timeAgo(request.expires_at) })}
          </div>
        )}

        {request.status === 'rejected' && request.rejection_reason && (
          <div className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <span className="font-medium">{t('coachNote')}:</span> {request.rejection_reason}
          </div>
        )}

        {request.athlete_message && (
          <div className="mt-4 rounded-lg bg-navy-700/50 p-3">
            <span className="text-xs font-semibold text-zinc-400">{t('yourMessage')}</span>
            <p className="mt-1 text-sm text-zinc-300">{request.athlete_message}</p>
          </div>
        )}

        {request.status === 'pending' && (
          <Button variant="danger" className="mt-5 gap-2" onClick={handleCancel} isLoading={cancelRequest.isPending}>
            <X className="h-4 w-4" /> {t('cancelRequest')}
          </Button>
        )}

        {request.status === 'accepted' && request.booking && (
          <Button className="mt-5 w-full" onClick={() => router.push(`/athlete/bookings/${request.booking!.uuid}`)}>
            {t('viewBooking')}
          </Button>
        )}
      </div>
    </div>
  )
}
