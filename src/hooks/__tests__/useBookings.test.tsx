import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAthleteBookings,
  useAthleteBookingDetail,
  useCancelBookingAthlete,
  useCoachBookings,
  useCoachBookingDetail,
  useCompleteBooking,
  useMarkNoShow,
  useCancelBookingCoach,
  useSetSessionLink,
} from '../useBookings'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/booking.service', () => ({
  bookingService: {
    listAthlete: vi.fn(),
    getAthlete: vi.fn(),
    cancelAthlete: vi.fn(),
    listCoach: vi.fn(),
    getCoach: vi.fn(),
    complete: vi.fn(),
    markNoShow: vi.fn(),
    cancelCoach: vi.fn(),
    setSessionLink: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

const { bookingService } = await import('@/services/booking.service')
const toast = (await import('react-hot-toast')).default

const page = { data: [{ uuid: 'b1' }], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } }
const booking = { uuid: 'b1', status: 'pending' }

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('athlete booking hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useAthleteBookings fetches the athlete list', async () => {
    vi.mocked(bookingService.listAthlete).mockResolvedValue(page as never)
    const { result } = renderHook(() => useAthleteBookings('pending'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(bookingService.listAthlete).toHaveBeenCalledWith('pending')
    expect(result.current.data).toEqual(page)
  })

  it('useAthleteBookingDetail fetches by uuid', async () => {
    vi.mocked(bookingService.getAthlete).mockResolvedValue(booking as never)
    const { result } = renderHook(() => useAthleteBookingDetail('b1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(bookingService.getAthlete).toHaveBeenCalledWith('b1')
  })

  it('useAthleteBookingDetail is disabled without uuid', () => {
    const { result } = renderHook(() => useAthleteBookingDetail(''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(bookingService.getAthlete).not.toHaveBeenCalled()
  })

  it('useCancelBookingAthlete cancels, toasts and invalidates', async () => {
    vi.mocked(bookingService.cancelAthlete).mockResolvedValue({} as never)
    const { result } = renderHook(() => useCancelBookingAthlete(), { wrapper: createWrapper() })
    await actAsync(() => result.current.mutate({ uuid: 'b1', reason: 'changed mind' }))
    expect(bookingService.cancelAthlete).toHaveBeenCalledWith('b1', 'changed mind')
    expect(toast.success).toHaveBeenCalled()
  })

  it('useCancelBookingAthlete toasts the error on failure', async () => {
    vi.mocked(bookingService.cancelAthlete).mockRejectedValue(new Error('nope'))
    const { result } = renderHook(() => useCancelBookingAthlete(), { wrapper: createWrapper() })
    await actAsync(() => result.current.mutate({ uuid: 'b1' }))
    expect(toast.error).toHaveBeenCalledWith('nope')
  })
})

describe('coach booking hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useCoachBookings fetches the coach list', async () => {
    vi.mocked(bookingService.listCoach).mockResolvedValue(page as never)
    const { result } = renderHook(() => useCoachBookings(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(bookingService.listCoach).toHaveBeenCalledWith(undefined)
  })

  it('useCoachBookingDetail fetches by uuid', async () => {
    vi.mocked(bookingService.getCoach).mockResolvedValue(booking as never)
    const { result } = renderHook(() => useCoachBookingDetail('b1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(bookingService.getCoach).toHaveBeenCalledWith('b1')
  })

  it('useCompleteBooking completes the session', async () => {
    vi.mocked(bookingService.complete).mockResolvedValue({} as never)
    const { result } = renderHook(() => useCompleteBooking(), { wrapper: createWrapper() })
    await actAsync(() => result.current.mutate({ uuid: 'b1', notes: 'great' }))
    expect(bookingService.complete).toHaveBeenCalledWith('b1', 'great')
    expect(toast.success).toHaveBeenCalled()
  })

  it('useMarkNoShow marks the booking', async () => {
    vi.mocked(bookingService.markNoShow).mockResolvedValue({} as never)
    const { result } = renderHook(() => useMarkNoShow(), { wrapper: createWrapper() })
    await actAsync(() => result.current.mutate('b1'))
    expect(bookingService.markNoShow).toHaveBeenCalledWith('b1')
  })

  it('useCancelBookingCoach cancels with reason', async () => {
    vi.mocked(bookingService.cancelCoach).mockResolvedValue({} as never)
    const { result } = renderHook(() => useCancelBookingCoach(), { wrapper: createWrapper() })
    await actAsync(() => result.current.mutate({ uuid: 'b1', reason: 'busy' }))
    expect(bookingService.cancelCoach).toHaveBeenCalledWith('b1', 'busy')
  })

  it('useSetSessionLink updates the link', async () => {
    vi.mocked(bookingService.setSessionLink).mockResolvedValue({} as never)
    const { result } = renderHook(() => useSetSessionLink(), { wrapper: createWrapper() })
    await actAsync(() => result.current.mutate({ uuid: 'b1', link: 'https://meet.example/x' }))
    expect(bookingService.setSessionLink).toHaveBeenCalledWith('b1', 'https://meet.example/x')
    expect(toast.success).toHaveBeenCalled()
  })
})

async function actAsync(callback: () => void) {
  const { act } = await import('@testing-library/react')
  await act(async () => {
    callback()
  })
}
