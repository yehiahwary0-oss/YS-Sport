import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { useBookingPayment } from '../useBookingPayment'

vi.mock('@/services/booking.service', () => ({
  bookingService: { getAthlete: vi.fn() },
}))

const { bookingService } = await import('@/services/booking.service')

const bookingPending = {
  uuid: 'b1',
  status: 'pending',
  payment: { status: 'pending', amount: '50', currency: 'USD' },
}
const bookingPaid = {
  uuid: 'b1',
  status: 'confirmed',
  payment: { status: 'paid', amount: '50', currency: 'USD' },
}

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}

describe('useBookingPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(bookingService.getAthlete).mockResolvedValue(bookingPending as never)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not fetch while disabled', () => {
    renderHook(() => useBookingPayment('b1', false), { wrapper: createWrapper() })
    expect(bookingService.getAthlete).not.toHaveBeenCalled()
  })

  it('fetches when enabled and stops polling once the payment is settled', async () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(() => useBookingPayment('b1', true), {
      wrapper: createWrapper(),
    })

    await flush()
    expect(bookingService.getAthlete).toHaveBeenCalledTimes(1)
    expect(result.current.data?.payment?.status).toBe('pending')

    vi.mocked(bookingService.getAthlete).mockResolvedValue(bookingPaid as never)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000)
    })
    rerender()

    expect(result.current.data?.payment?.status).toBe('paid')
    expect(vi.mocked(bookingService.getAthlete).mock.calls.length).toBe(2)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })
    rerender()

    expect(vi.mocked(bookingService.getAthlete).mock.calls.length).toBe(2)
  })

  it('stops polling and reports timedOut after 30s while still pending', async () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(() => useBookingPayment('b1', true), {
      wrapper: createWrapper(),
    })

    await flush()
    expect(result.current.data?.payment?.status).toBe('pending')
    expect(result.current.timedOut).toBe(false)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(35_000)
    })
    rerender()

    expect(result.current.timedOut).toBe(true)
    expect(result.current.data?.payment?.status).toBe('pending')

    const callsAfterTimeout = vi.mocked(bookingService.getAthlete).mock.calls.length

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })
    rerender()

    expect(vi.mocked(bookingService.getAthlete).mock.calls.length).toBe(callsAfterTimeout)
  })

  it('invalidates the booking detail query when the payment settles', async () => {
    vi.useFakeTimers()

    const detailCalls = { count: 0 }

    function TestConsumer() {
      const detailRef = useRef(detailCalls)
      useQuery({
        queryKey: ['athlete', 'bookings', 'b1'],
        queryFn: async () => {
          detailRef.current.count += 1
          return {}
        },
      })
      return <div>{useBookingPayment('b1', true).data?.payment?.status ?? 'none'}</div>
    }

    const { rerender } = renderHook(() => TestConsumer(), { wrapper: createWrapper() })

    await flush()
    expect(detailCalls.count).toBe(1)

    vi.mocked(bookingService.getAthlete).mockResolvedValue(bookingPaid as never)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000)
    })
    rerender()
    await flush()

    expect(detailCalls.count).toBeGreaterThanOrEqual(2)
  })
})
