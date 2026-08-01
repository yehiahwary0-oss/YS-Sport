'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Video, Check, UserX, X, Link as LinkIcon } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChatPanel } from '@/components/shared/ChatPanel'
import {
  useCoachBookingDetail,
  useCompleteBooking,
  useMarkNoShow,
  useCancelBookingCoach,
  useSetSessionLink,
} from '@/hooks/useBookings'
import { useFindBookingConversation } from '@/hooks/useConversation'
import { formatPrice, formatDateTime } from '@/lib/utils'

export default function CoachBookingDetailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const t = useTranslations('coach.bookings')
  const { data: booking, isLoading, isError } = useCoachBookingDetail(uuid)
  const { data: conversation } = useFindBookingConversation(uuid)

  const completeBooking = useCompleteBooking()
  const markNoShow = useMarkNoShow()
  const cancelBooking = useCancelBookingCoach()
  const setSessionLink = useSetSessionLink()

  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [link, setLink] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [notes, setNotes] = useState('')

  if (isLoading) return <FullPageSpinner />
  if (isError) return <ErrorState onRetry={() => window.location.reload()} />
  if (!booking) return <EmptyState icon={X} title={t('notFound')} description={t('notFoundDesc')} />

  const handleSetLink = () => {
    if (!link.trim()) return
    setSessionLink.mutate({ uuid: booking.uuid, link: link.trim() }, { onSuccess: () => setLinkModalOpen(false) })
  }

  const handleComplete = () => {
    completeBooking.mutate({ uuid: booking.uuid, notes }, { onSuccess: () => setCompleteModalOpen(false) })
  }

  const handleCancel = () => {
    cancelBooking.mutate({ uuid: booking.uuid, reason: cancelReason }, { onSuccess: () => setCancelModalOpen(false) })
  }

  const isConfirmed = booking.status === 'confirmed'

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={booking.athlete?.avatar_path} name={booking.athlete?.display_name ?? '—'} size="lg" />
            <div>
              <h2 className="font-display text-lg font-semibold text-zinc-100">{booking.athlete?.display_name}</h2>
              <p className="text-sm text-zinc-500">{booking.package?.name}</p>
            </div>
          </div>
          <Badge status={booking.status}>{t(booking.status === 'no_show' ? 'noShow' : booking.status)}</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-5 sm:grid-cols-3">
          <div>
            <span className="text-xs text-zinc-500">{t('yourPayout')}</span>
            <p className="font-display font-semibold text-zinc-100">
              {booking.payment ? formatPrice(booking.payment.coach_payout, booking.payment.currency) : '—'}
            </p>
          </div>
          <div>
            <span className="text-xs text-zinc-500">{t('sessionTime')}</span>
            <p className="text-sm text-zinc-300">
              {booking.slot ? formatDateTime(booking.slot.starts_at) : t('pendingCoordination')}
            </p>
          </div>
          {booking.session_link && (
            <div>
              <span className="text-xs text-zinc-500">{t('sessionLink')}</span>
              <a href={booking.session_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-green-400 hover:underline">
                <Video className="h-3.5 w-3.5" /> {t('joinSession')}
              </a>
            </div>
          )}
        </div>

        {isConfirmed && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="secondary" className="gap-2" onClick={() => setLinkModalOpen(true)}>
              <LinkIcon className="h-4 w-4" /> {booking.session_link ? t('updateLink') : t('sessionLink')}
            </Button>
            <Button className="gap-2" onClick={() => setCompleteModalOpen(true)}>
              <Check className="h-4 w-4" /> {t('completeButton')}
            </Button>
            <Button variant="secondary" className="gap-2" onClick={() => markNoShow.mutate(booking.uuid)} isLoading={markNoShow.isPending}>
              <UserX className="h-4 w-4" /> {t('noShowButton')}
            </Button>
            <Button variant="danger" className="gap-2" onClick={() => setCancelModalOpen(true)}>
              <X className="h-4 w-4" /> {t('cancelButton')}
            </Button>
          </div>
        )}
      </div>

      {/* Chat */}
      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-zinc-100">{t('messages')}</h3>
        <ChatPanel conversationUuid={conversation?.uuid} />
      </div>

      {/* Session link modal */}
      <Modal open={linkModalOpen} onOpenChange={setLinkModalOpen} title={t('linkModalTitle')}>
        <Input
          label={t('meetingUrl')}
          placeholder={t('sessionLinkPlaceholder')}
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <Button className="mt-5 w-full" onClick={handleSetLink} isLoading={setSessionLink.isPending}>
          {t('saveLink')}
        </Button>
      </Modal>

      {/* Complete modal */}
      <Modal open={completeModalOpen} onOpenChange={setCompleteModalOpen} title={t('completeModalTitle')}>
        <Textarea
          label={t('sessionNotes')}
          placeholder={t('sessionNotesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button className="mt-5 w-full" onClick={handleComplete} isLoading={completeBooking.isPending}>
          {t('confirmCompletion')}
        </Button>
      </Modal>

      {/* Cancel modal */}
      <Modal open={cancelModalOpen} onOpenChange={setCancelModalOpen} title={t('cancelModalTitle')}>
        <Textarea
          label={t('reasonOptional')}
          placeholder={t('cancelReasonPlaceholder')}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>{t('keepBooking')}</Button>
          <Button variant="danger" onClick={handleCancel} isLoading={cancelBooking.isPending}>
            {t('cancelBooking')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
