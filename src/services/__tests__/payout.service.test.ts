import { describe, it, expect, vi, beforeEach } from 'vitest'
import { payoutService } from '../payout.service'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const { api } = await import('@/lib/api')

const mockPayout = {
  uuid: 'p1',
  payout_ref: 'PO-2026-0001',
  amount: 50,
  currency: 'USD',
  payout_method: 'bank_transfer',
  payout_reference: null,
  status: 'pending',
  requested_at: '2026-07-01T10:00:00Z',
  approved_at: null,
  sent_at: null,
  rejection_reason: null,
  failed_reason: null,
}

describe('payoutService.history', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls GET /coach/payouts and returns the flat array', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [mockPayout] } })

    const result = await payoutService.history()

    expect(api.get).toHaveBeenCalledWith('/coach/payouts')
    expect(result).toEqual([mockPayout])
  })

  it('throws on API error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

    await expect(payoutService.history()).rejects.toThrow('Network error')
  })
})

describe('payoutService.summary', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls GET /coach/payouts/summary and unwraps the envelope', async () => {
    const summary = {
      lifetime_earned: 1000,
      this_month_earned: 200,
      pending_payout: 50,
      total_commission: 100,
      available_balance: 850,
      withdrawn_total: 100,
      currency: 'USD',
    }
    vi.mocked(api.get).mockResolvedValue({ data: { data: summary } })

    const result = await payoutService.summary()

    expect(api.get).toHaveBeenCalledWith('/coach/payouts/summary')
    expect(result).toEqual(summary)
  })
})

describe('payoutService.listEarnings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls GET /coach/payments with status and page, and paginates the envelope', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: { data: [{ uuid: 'pay-1' }], current_page: 2, per_page: 20, last_page: 3, total: 50 },
      },
    })

    const result = await payoutService.listEarnings('paid', 2)

    expect(api.get).toHaveBeenCalledWith('/coach/payments', { params: { status: 'paid', page: 2 } })
    expect(result.meta).toEqual({ current_page: 2, per_page: 20, last_page: 3, total: 50 })
    expect(result.data).toEqual([{ uuid: 'pay-1' }])
  })
})

describe('payoutService.earningsSummary', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls GET /coach/payments/summary and unwraps the envelope', async () => {
    const summary = {
      lifetime_earned: 1000,
      this_month_earned: 200,
      pending_payout: 50,
      total_commission_paid: 100,
      available_balance: 850,
      withdrawn_total: 100,
      currency: 'USD',
    }
    vi.mocked(api.get).mockResolvedValue({ data: { data: summary } })

    const result = await payoutService.earningsSummary()

    expect(api.get).toHaveBeenCalledWith('/coach/payments/summary')
    expect(result).toEqual(summary)
  })
})

describe('payoutService.requestPayout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('POSTs the input to /coach/payouts/request and returns the created payout', async () => {
    const input = { amount: 50, payout_method: 'bank_transfer', payout_reference: 'acc-123' }
    const response = { uuid: 'p1', payout_ref: 'PO-2026-0002', amount: 50, status: 'pending' }
    vi.mocked(api.post).mockResolvedValue({ data: { data: response } })

    const result = await payoutService.requestPayout(input)

    expect(api.post).toHaveBeenCalledWith('/coach/payouts/request', input)
    expect(result).toEqual(response)
  })
})

describe('payoutService.get', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls GET /coach/payouts/{uuid} and unwraps the envelope', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: mockPayout } })

    const result = await payoutService.get('p1')

    expect(api.get).toHaveBeenCalledWith('/coach/payouts/p1')
    expect(result).toEqual(mockPayout)
  })
})
