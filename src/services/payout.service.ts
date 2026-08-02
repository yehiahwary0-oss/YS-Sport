import { api } from '@/lib/api'
import { toPaginated } from '@/lib/pagination'
import type { Payment, PaginatedResponse } from '@/types'
import type {
  CoachEarningsSummary,
  CoachPayout,
  CoachPayoutSummary,
  RequestPayoutInput,
  RequestPayoutResponse,
} from '@/types/payout'

/** Mirrors PayoutService::MIN_PAYOUT_AMOUNT on the backend. */
export const MIN_PAYOUT_AMOUNT = 20

export const payoutService = {
  async listEarnings(status?: string, page = 1): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get('/coach/payments', { params: { status, page } })
    return toPaginated<Payment>(data.data)
  },

  async earningsSummary(): Promise<CoachEarningsSummary> {
    const { data } = await api.get('/coach/payments/summary')
    return data.data as CoachEarningsSummary
  },

  async history(): Promise<CoachPayout[]> {
    const { data } = await api.get('/coach/payouts')
    return data.data as CoachPayout[]
  },

  async summary(): Promise<CoachPayoutSummary> {
    const { data } = await api.get('/coach/payouts/summary')
    return data.data as CoachPayoutSummary
  },

  async requestPayout(input: RequestPayoutInput): Promise<RequestPayoutResponse> {
    const { data } = await api.post('/coach/payouts/request', input)
    return data.data as RequestPayoutResponse
  },

  async get(uuid: string): Promise<CoachPayout> {
    const { data } = await api.get(`/coach/payouts/${uuid}`)
    return data.data as CoachPayout
  },
}
