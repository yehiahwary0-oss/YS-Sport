import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEarningsSummary, useCoachPayments } from '../useEarnings'

vi.mock('@/services/payment.service', () => ({
  paymentService: {
    summary: vi.fn(),
    listCoach: vi.fn(),
  },
}))

const { paymentService } = await import('@/services/payment.service')

const page = { data: [], meta: { current_page: 1, per_page: 15, last_page: 1, total: 0 } }

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('earnings hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useEarningsSummary fetches the summary', async () => {
    const summary = { total_earnings: '120.00', available: '80.00', pending: '40.00' }
    vi.mocked(paymentService.summary).mockResolvedValue(summary as never)
    const { result } = renderHook(() => useEarningsSummary(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(summary)
  })

  it('useCoachPayments fetches with the status filter', async () => {
    vi.mocked(paymentService.listCoach).mockResolvedValue(page as never)
    const { result } = renderHook(() => useCoachPayments('paid'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(paymentService.listCoach).toHaveBeenCalledWith('paid')
  })

  it('reports the error state', async () => {
    vi.mocked(paymentService.summary).mockRejectedValue(new Error('down'))
    const { result } = renderHook(() => useEarningsSummary(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
