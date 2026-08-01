'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Check, X, Clock } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  useServiceRequestDetail,
  useAcceptServiceRequest,
  useRejectServiceRequest,
} from '@/hooks/useServiceRequest'
import { formatPrice, timeAgo } from '@/lib/utils'

export default function CoachRequestDetailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const router = useRouter()
  const t = useTranslations('coach.requests')
  const { data: request, isLoading, isError } = useServiceRequestDetail(uuid, 'coach')
  const acceptRequest = useAcceptServiceRequest()
  const rejectRequest = useRejectServiceRequest()

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [reason, setReason] = useState('')

  if (isLoading) return <FullPageSpinner />
  if (isError) return <ErrorState onRetry={() => window.location.reload()} />
  if (!request) return <p className="text-sm text-zinc-500">{t('notFound')}</p>

  const handleAccept = () => {
    acceptRequest.mutate(request.uuid, {
      onSuccess: () => router.push('/coach/requests'),
    })
  }

  const handleReject = () => {
    rejectRequest.mutate(
      { uuid: request.uuid, reason },
      { onSuccess: () => router.push('/coach/requests') }
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={request.athlete?.avatar_path} name={request.athlete?.display_name ?? '—'} size="lg" />
            <div>
              <h2 className="font-display text-lg font-semibold text-zinc-100">{request.athlete?.display_name}</h2>
              <p className="text-sm text-zinc-500">{request.package_name}</p>
            </div>
          </div>
          <Badge status={request.status}>{t(request.status)}</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-5">
          <div>
            <span className="text-xs text-zinc-500">{t('price')}</span>
            <p className="font-display font-semibold text-zinc-100">{formatPrice(request.price_amount, request.price_currency)}</p>
          </div>
          <div>
            <span className="text-xs text-zinc-500">{t('received')}</span>
            <p className="text-sm text-zinc-300">{timeAgo(request.created_at)}</p>
          </div>
        </div>

        {request.status === 'pending' && (
          <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-400">
            <Clock className="h-4 w-4" /> {t('expires', { time: timeAgo(request.expires_at) })}
          </div>
        )}

        {request.athlete_message && (
          <div className="mt-4 rounded-lg bg-navy-700/50 p-3">
            <span className="text-xs font-semibold text-zinc-400">{t('athleteMessage')}</span>
            <p className="mt-1 text-sm text-zinc-300">{request.athlete_message}</p>
          </div>
        )}

        {request.status === 'pending' && (
          <div className="mt-5 flex gap-3">
            <Button className="flex-1 gap-2" onClick={handleAccept} isLoading={acceptRequest.isPending}>
              <Check className="h-4 w-4" /> {t('acceptButton')}
            </Button>
            <Button variant="danger" className="flex-1 gap-2" onClick={() => setRejectModalOpen(true)}>
              <X className="h-4 w-4" /> {t('rejectButton')}
            </Button>
          </div>
        )}

        {request.status === 'accepted' && request.booking && (
          <Button className="mt-5 w-full" onClick={() => router.push(`/coach/bookings/${request.booking!.uuid}`)}>
            {t('viewBooking')}
          </Button>
        )}
      </div>

      <Modal open={rejectModalOpen} onOpenChange={setRejectModalOpen} title={t('rejectModalTitle')}>
        <Textarea
          label={t('reasonOptional')}
          placeholder={t('rejectReasonPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleReject} isLoading={rejectRequest.isPending}>
            {t('rejectButton')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
