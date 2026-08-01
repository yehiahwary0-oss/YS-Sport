'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/navigation'
import { useTranslations } from 'next-intl'
import { Calendar, Video, Star, X, CreditCard, ExternalLink, Banknote, Percent, CheckCircle } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { StarRating } from '@/components/ui/StarRating'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChatPanel } from '@/components/shared/ChatPanel'
import { useAthleteBookingDetail, useCancelBookingAthlete } from '@/hooks/useBookings'
import { useFindBookingConversation } from '@/hooks/useConversation'
import { useCreateCheckout, useConfirmPaymentSuccess, useMarkManualPaid, useValidatePromoCode } from '@/hooks/usePayments'
import { reviewService } from '@/services/review.service'
import { getApiError } from '@/lib/api'
import { formatPrice, formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import type { PromoCodeValidation } from '@/types'

export default function AthleteBookingDetailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('athlete.bookings')
  const ts = useTranslations('booking.status')

  const { data: booking, isLoading, isError } = useAthleteBookingDetail(uuid)
  const { data: conversation } = useFindBookingConversation(uuid)
  const cancelBooking = useCancelBookingAthlete()
  const createCheckout = useCreateCheckout()
  const confirmPaymentSuccess = useConfirmPaymentSuccess()
  const markManualPaid = useMarkManualPaid()

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [manualRefModalOpen, setManualRefModalOpen] = useState(false)
  const [manualRef, setManualRef] = useState('')
  const [manualNotes, setManualNotes] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null)
  const [promoError, setPromoError] = useState('')
  const validatePromoCode = useValidatePromoCode()

  if (isLoading) return <FullPageSpinner />
  if (isError) return <ErrorState onRetry={() => window.location.reload()} />
  if (!booking) return <EmptyState icon={X} title={t('notFound')} description={t('notFoundDesc')} />

  const handleCancel = () => {
    cancelBooking.mutate(
      { uuid: booking.uuid, reason: cancelReason },
      { onSuccess: () => setCancelModalOpen(false) }
    )
  }

  const handleSubmitReview = async () => {
    if (rating === 0) return
    setSubmittingReview(true)
    try {
      await reviewService.submit({ booking_uuid: booking.uuid, rating, comment: comment || undefined })
      toast.success(t('reviewSubmitted'))
      setReviewModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['athlete', 'bookings', uuid] })
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setSubmittingReview(false)
    }
  }

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const canReview = booking.status === 'completed' && !booking.review

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={booking.coach?.avatar_path} name={booking.coach?.display_name ?? '—'} size="lg" />
            <div>
              <h2 className="font-display text-lg font-semibold text-zinc-100">{booking.coach?.display_name}</h2>
              <p className="text-sm text-zinc-500">{booking.package?.name}</p>
            </div>
          </div>
          <Badge status={booking.status}>{ts(booking.status.replace('_', '-'))}</Badge>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-5 sm:grid-cols-3">
          <div>
            <span className="text-xs text-zinc-500">{t('price')}</span>
            <p className="font-display font-semibold text-zinc-100">{formatPrice(booking.price_amount, booking.price_currency)}</p>
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
              <a
                href={booking.session_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-green-400 hover:underline"
              >
                <Video className="h-3.5 w-3.5" /> {t('joinSession')}
              </a>
            </div>
          )}
        </div>

        {booking.payment && booking.payment.status === 'pending' && (
          <div className="mt-5 border-t border-zinc-800 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500">{t('paymentRequired')}</span>
                <p className="mt-1 font-display text-lg font-bold text-amber-400">
                  {formatPrice(booking.payment.amount, booking.payment.currency)}
                </p>
                {promoValidation && (
                  <p className="mt-1 font-display text-sm text-green-400">
                    {t('discountApplied')}: -{formatPrice(String(promoValidation.discount_amount), booking.payment.currency)}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    createCheckout.mutate(
                      { bookingUuid: uuid, returnUrl: `${window.location.origin}/athlete/bookings/${uuid}`, promoCode: promoValidation?.code },
                      {
                        onSuccess: (session) => {
                          window.open(session.checkout_url, '_blank')
                        },
                      }
                    )
                  }}
                  isLoading={createCheckout.isPending}
                  className="gap-2"
                >
                  <CreditCard className="h-4 w-4" /> {t('payOnline')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setManualRefModalOpen(true)}
                  className="gap-2"
                >
                  <Banknote className="h-4 w-4" /> {t('bankTransfer')}
                </Button>
              </div>
            </div>
            {/* Promo code */}
            <div className="mt-4 flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label={t('promoCode')}
                  placeholder={t('promoCodePlaceholder')}
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoValidation(null); setPromoError('') }}
                />
                {promoError && <p className="mt-1 text-xs text-red-400">{promoError}</p>}
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="mb-0.5 gap-1.5"
                onClick={() => {
                  if (!promoCode.trim()) return
                  setPromoError('')
                  setPromoValidation(null)
                  validatePromoCode.mutate(
                    { bookingUuid: uuid, code: promoCode.trim() },
                    {
                      onSuccess: (validation) => setPromoValidation(validation),
                      onError: (err) => { setPromoError(getApiError(err)); setPromoValidation(null) },
                    }
                  )
                }}
                isLoading={validatePromoCode.isPending}
                disabled={!promoCode.trim()}
              >
                <Percent className="h-3.5 w-3.5" /> {t('applyCode')}
              </Button>
              {promoValidation && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-0.5"
                  onClick={() => { setPromoCode(''); setPromoValidation(null); setPromoError('') }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {booking.payment.external_reference && (
              <p className="mt-2 text-xs text-zinc-500">
                {t('reference')}: <span className="font-mono">{booking.payment.external_reference}</span>
              </p>
            )}
          </div>
        )}

        {booking.payment && booking.payment.status === 'paid' && (
          <div className="mt-5 border-t border-zinc-800 pt-5">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CreditCard className="h-4 w-4" />
              <span>{t('paymentConfirmed')} — {formatPrice(booking.payment.amount, booking.payment.currency)}</span>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          {canReview && (
            <Button onClick={() => setReviewModalOpen(true)} className="gap-2">
              <Star className="h-4 w-4" /> {t('leaveReview')}
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" onClick={() => setCancelModalOpen(true)} className="gap-2">
              <X className="h-4 w-4" /> {t('cancelBooking')}
            </Button>
          )}
        </div>
      </div>

      {/* Chat */}
      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-zinc-100">{t('messages')}</h3>
        <ChatPanel conversationUuid={conversation?.uuid} />
      </div>

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

      {/* Manual payment reference modal */}
      <Modal open={manualRefModalOpen} onOpenChange={(open) => { setManualRefModalOpen(open); if (!open) { setManualRef(''); setManualNotes(''); } }} title={t('bankTransferTitle')}>
        <p className="mb-4 text-sm text-zinc-400">
          {t('bankTransferDesc')}
        </p>
        <Input
          label={t('transactionRef')}
          placeholder={t('transactionRefPlaceholder')}
          value={manualRef}
          onChange={(e) => setManualRef(e.target.value)}
        />
        <Textarea
          label={t('notesOptional')}
          placeholder={t('notesPlaceholder')}
          value={manualNotes}
          onChange={(e) => setManualNotes(e.target.value)}
        />
        <Button
          className="mt-5 w-full"
          onClick={() => {
            markManualPaid.mutate(
              { bookingUuid: uuid, externalReference: manualRef, notes: manualNotes, promoCode: promoValidation?.code },
              { onSuccess: () => { setManualRefModalOpen(false); setManualRef(''); setManualNotes('') } }
            )
          }}
          disabled={!manualRef.trim()}
          isLoading={markManualPaid.isPending}
        >
          {t('submitReference')}
        </Button>
      </Modal>

      {/* Review modal */}
      <Modal open={reviewModalOpen} onOpenChange={setReviewModalOpen} title={t('rateSession')}>
        <div className="flex justify-center py-2">
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
        <Textarea
          label={t('commentOptional')}
          placeholder={t('commentPlaceholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button className="mt-5 w-full" onClick={handleSubmitReview} disabled={rating === 0} isLoading={submittingReview}>
          {t('submitReview')}
        </Button>
      </Modal>
    </div>
  )
}
