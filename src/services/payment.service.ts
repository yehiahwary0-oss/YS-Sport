import { api } from '@/lib/api'
import { toPaginated } from '@/lib/pagination'
import type { CheckoutSession, Payment, PaginatedResponse, PromoCodeValidation } from '@/types'

export interface EarningsSummary {
  lifetime_earned: string
  this_month_earned: string
  pending_payout: string
  total_commission_paid: string
  currency: string
}

export const paymentService = {

  async listCoach(status?: string, page = 1): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get('/coach/payments', { params: { status, page } })
    return toPaginated<Payment>(data.data)
  },

  async summary(): Promise<EarningsSummary> {
    const { data } = await api.get('/coach/payments/summary')
    return data.data as EarningsSummary
  },

  async listAthlete(page = 1): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get('/athlete/payments', { params: { page } })
    return toPaginated<Payment>(data.data)
  },

  async createCheckout(bookingUuid: string, returnUrl?: string, cancelUrl?: string, promoCode?: string): Promise<CheckoutSession> {
    const { data } = await api.post(`/bookings/${bookingUuid}/pay`, { return_url: returnUrl, cancel_url: cancelUrl, promo_code: promoCode })
    return data.data as CheckoutSession
  },

  async confirmSuccess(bookingUuid: string): Promise<Payment> {
    const { data } = await api.post(`/bookings/${bookingUuid}/pay/success`)
    return data.data as Payment
  },

  async confirmCancelled(bookingUuid: string): Promise<void> {
    await api.post(`/bookings/${bookingUuid}/pay/cancel`)
  },

  async markManualPaid(bookingUuid: string, externalReference: string, notes?: string, promoCode?: string): Promise<void> {
    await api.post(`/bookings/${bookingUuid}/mark-paid`, { external_reference: externalReference, notes, promo_code: promoCode })
  },

  async validatePromoCode(bookingUuid: string, code: string): Promise<PromoCodeValidation> {
    const { data } = await api.post(`/bookings/${bookingUuid}/validate-promo`, { code })
    return data.data as PromoCodeValidation
  },
}
