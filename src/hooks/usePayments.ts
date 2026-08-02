import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentService } from '@/services/payment.service'
import { getApiError } from '@/lib/api'
import toast from 'react-hot-toast'

export function useAthletePayments(page = 1) {
  return useQuery({
    queryKey: ['athlete', 'payments', page],
    queryFn: () => paymentService.listAthlete(page),
  })
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: ({ bookingUuid, returnUrl, cancelUrl, promoCode }: { bookingUuid: string; returnUrl?: string; cancelUrl?: string; promoCode?: string }) =>
      paymentService.createCheckout(bookingUuid, returnUrl, cancelUrl, promoCode),
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useConfirmPaymentSuccess() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookingUuid: string) => paymentService.confirmSuccess(bookingUuid),
    onSuccess: () => {
      toast.success('Payment verified!')
      queryClient.invalidateQueries({ queryKey: ['athlete', 'payments'] })
      queryClient.invalidateQueries({ queryKey: ['athlete', 'bookings'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useConfirmPaymentCancelled() {
  return useMutation({
    mutationFn: (bookingUuid: string) => paymentService.confirmCancelled(bookingUuid),
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useMarkManualPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingUuid, externalReference, notes, promoCode }: { bookingUuid: string; externalReference: string; notes?: string; promoCode?: string }) =>
      paymentService.markManualPaid(bookingUuid, externalReference, notes, promoCode),
    onSuccess: () => {
      toast.success('Payment reference submitted. Awaiting admin confirmation.')
      queryClient.invalidateQueries({ queryKey: ['athlete', 'bookings'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useValidatePromoCode() {
  return useMutation({
    mutationFn: ({ bookingUuid, code }: { bookingUuid: string; code: string }) =>
      paymentService.validatePromoCode(bookingUuid, code),
  })
}
