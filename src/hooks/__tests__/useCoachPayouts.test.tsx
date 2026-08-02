import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useCoachEarnings,
  useCoachEarningsSummary,
  useCoachPayouts,
  useCoachPayoutSummary,
  useRequestPayout,
} from '../useCoachPayouts'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/payout.service', () => ({
  payoutService: {
    listEarnings: vi.fn(),
    earningsSummary: vi.fn(),
    history: vi.fn(),
    summary: vi.fn(),
    requestPayout: vi.fn(),
  },
}))

const { payoutService } = await import('@/services/payout.service')
const toast = (await import('react-hot-toast')).default

const mockSummary = {
  lifetime_earned: 1000,
  this_month_earned: 200,
  pending_payout: 50,
  total_commission: 100,
  available_balance: 850,
  withdrawn_total: 100,
  currency: 'USD',
}

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

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('useCoachPayoutSummary', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns data on success', async () => {
    vi.mocked(payoutService.summary).mockResolvedValue(mockSummary)

    const { result } = renderHook(() => useCoachPayoutSummary(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockSummary)
  })

  it('returns loading state initially', () => {
    vi.mocked(payoutService.summary).mockResolvedValue(mockSummary)

    const { result } = renderHook(() => useCoachPayoutSummary(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('returns error on failure', async () => {
    vi.mocked(payoutService.summary).mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() => useCoachPayoutSummary(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

describe('useCoachPayouts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns payout history on success', async () => {
    vi.mocked(payoutService.history).mockResolvedValue([mockPayout])

    const { result } = renderHook(() => useCoachPayouts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockPayout])
  })
})

describe('useCoachEarnings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('passes status to the service and returns paginated data', async () => {
    vi.mocked(payoutService.listEarnings).mockResolvedValue({
      data: [mockPayout],
      meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
    })

    const { result } = renderHook(() => useCoachEarnings('paid'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(payoutService.listEarnings).toHaveBeenCalledWith('paid')
    expect(result.current.data?.meta.total).toBe(1)
  })
})

describe('useCoachEarningsSummary', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns earnings summary on success', async () => {
    vi.mocked(payoutService.earningsSummary).mockResolvedValue(mockSummary)

    const { result } = renderHook(() => useCoachEarningsSummary(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockSummary)
  })
})

describe('useRequestPayout', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requests a payout, shows a success toast and invalidates payout queries', async () => {
    vi.mocked(payoutService.history).mockResolvedValue([])
    vi.mocked(payoutService.requestPayout).mockResolvedValue({
      uuid: 'p1',
      payout_ref: 'PO-2026-0002',
      amount: 50,
      status: 'pending',
    })

    const { result } = renderHook(
      () => ({ history: useCoachPayouts(), request: useRequestPayout() }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => expect(result.current.history.isSuccess).toBe(true))
    expect(payoutService.history).toHaveBeenCalledTimes(1)

    result.current.request.mutate({ amount: 50, payout_method: 'bank_transfer' })

    await waitFor(() => expect(result.current.request.isSuccess).toBe(true))
    expect(payoutService.requestPayout).toHaveBeenCalledWith({
      amount: 50,
      payout_method: 'bank_transfer',
    })
    expect(toast.success).toHaveBeenCalledWith('Payout requested successfully.')
    await waitFor(() => expect(payoutService.history).toHaveBeenCalledTimes(2))
  })

  it('shows an error toast on failure', async () => {
    vi.mocked(payoutService.requestPayout).mockRejectedValue(
      new Error('Requested amount exceeds available balance.')
    )

    const { result } = renderHook(() => useRequestPayout(), { wrapper: createWrapper() })

    result.current.mutate({ amount: 500, payout_method: 'bank_transfer' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalled()
  })
})
