import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useCreateServiceRequest,
  useAthleteServiceRequests,
  useCoachServiceRequests,
  useServiceRequestDetail,
  useAcceptServiceRequest,
  useRejectServiceRequest,
  useCancelServiceRequest,
} from '../useServiceRequest'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/service-request.service', () => ({
  serviceRequestService: {
    create: vi.fn(),
    listAthlete: vi.fn(),
    listCoach: vi.fn(),
    getAthlete: vi.fn(),
    getCoach: vi.fn(),
    accept: vi.fn(),
    reject: vi.fn(),
    cancel: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

vi.mock('@/lib/analytics', () => ({
  ANALYTICS_EVENTS: { serviceRequestSent: 'service_request_sent', bookingCreated: 'booking_created' },
  trackEvent: vi.fn(),
}))

const { serviceRequestService } = await import('@/services/service-request.service')
const toast = (await import('react-hot-toast')).default
const { trackEvent } = await import('@/lib/analytics')

const request = { uuid: 'r1', status: 'pending' }
const page = { data: [request], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } }

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('service request hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useCreateServiceRequest creates, tracks and toasts', async () => {
    vi.mocked(serviceRequestService.create).mockResolvedValue(request as never)
    const { result } = renderHook(() => useCreateServiceRequest(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ coach_uuid: 'c1', package_uuid: 'pk1', message: 'hi' })
    })
    expect(serviceRequestService.create).toHaveBeenCalledWith({ coach_uuid: 'c1', package_uuid: 'pk1', message: 'hi' })
    expect(trackEvent).toHaveBeenCalledWith('service_request_sent')
    expect(toast.success).toHaveBeenCalled()
  })

  it('useAthleteServiceRequests fetches the athlete list', async () => {
    vi.mocked(serviceRequestService.listAthlete).mockResolvedValue(page as never)
    const { result } = renderHook(() => useAthleteServiceRequests('pending'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(serviceRequestService.listAthlete).toHaveBeenCalledWith('pending')
  })

  it('useCoachServiceRequests fetches the coach list', async () => {
    vi.mocked(serviceRequestService.listCoach).mockResolvedValue(page as never)
    const { result } = renderHook(() => useCoachServiceRequests(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(serviceRequestService.listCoach).toHaveBeenCalledWith(undefined)
  })

  it('useServiceRequestDetail routes by role', async () => {
    vi.mocked(serviceRequestService.getAthlete).mockResolvedValue(request as never)
    const { result } = renderHook(() => useServiceRequestDetail('r1', 'athlete'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(serviceRequestService.getAthlete).toHaveBeenCalledWith('r1')
  })

  it('useServiceRequestDetail uses the coach endpoint for coach role', async () => {
    vi.mocked(serviceRequestService.getCoach).mockResolvedValue(request as never)
    const { result } = renderHook(() => useServiceRequestDetail('r1', 'coach'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(serviceRequestService.getCoach).toHaveBeenCalledWith('r1')
  })

  it('useAcceptServiceRequest accepts, tracks and toasts', async () => {
    vi.mocked(serviceRequestService.accept).mockResolvedValue(request as never)
    const { result } = renderHook(() => useAcceptServiceRequest(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('r1')
    })
    expect(serviceRequestService.accept).toHaveBeenCalledWith('r1')
    expect(trackEvent).toHaveBeenCalledWith('booking_created')
    expect(toast.success).toHaveBeenCalled()
  })

  it('useRejectServiceRequest rejects with a reason', async () => {
    vi.mocked(serviceRequestService.reject).mockResolvedValue({} as never)
    const { result } = renderHook(() => useRejectServiceRequest(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'r1', reason: 'too busy' })
    })
    expect(serviceRequestService.reject).toHaveBeenCalledWith('r1', 'too busy')
    expect(toast.success).toHaveBeenCalledWith('Request declined.')
  })

  it('useCancelServiceRequest cancels and toasts', async () => {
    vi.mocked(serviceRequestService.cancel).mockResolvedValue({} as never)
    const { result } = renderHook(() => useCancelServiceRequest(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('r1')
    })
    expect(serviceRequestService.cancel).toHaveBeenCalledWith('r1')
    expect(toast.success).toHaveBeenCalledWith('Request cancelled.')
  })

  it('toasts the error message on failure', async () => {
    vi.mocked(serviceRequestService.accept).mockRejectedValue(new Error('conflict'))
    const { result } = renderHook(() => useAcceptServiceRequest(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('r1')
    })
    expect(toast.error).toHaveBeenCalledWith('conflict')
  })
})
