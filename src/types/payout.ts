// ── Payouts ────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'sent' | 'rejected' | 'failed'

export interface CoachPayout {
  uuid: string
  payout_ref: string
  amount: number
  currency: string
  payout_method: string
  payout_reference: string | null
  status: PayoutStatus
  requested_at: string
  approved_at: string | null
  sent_at: string | null
  rejection_reason: string | null
  failed_reason: string | null
}

/** GET /coach/payments/summary */
export interface CoachEarningsSummary {
  lifetime_earned: number
  this_month_earned: number
  pending_payout: number
  total_commission_paid: number
  available_balance: number
  withdrawn_total: number
  currency: string
}

/** GET /coach/payouts/summary */
export interface CoachPayoutSummary {
  lifetime_earned: number
  this_month_earned: number
  pending_payout: number
  total_commission: number
  available_balance: number
  withdrawn_total: number
  currency: string
}

export const PAYOUT_METHODS = ['bank_transfer', 'wallet', 'paypal'] as const

export type PayoutMethod = (typeof PAYOUT_METHODS)[number] | string

export interface RequestPayoutInput {
  amount: number
  payout_method: string
  payout_reference?: string
}

/** POST /coach/payouts/request */
export interface RequestPayoutResponse {
  uuid: string
  payout_ref: string
  amount: number
  status: PayoutStatus
}
