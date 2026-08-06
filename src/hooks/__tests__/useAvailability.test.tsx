import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAvailability, useCreateSlot, useBulkCreateSlots, useDeleteSlot } from '../useAvailability'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/availability.service', () => ({
  availabilityService: {
    list: vi.fn(),
    create: vi.fn(),
    bulkCreate: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

const { availabilityService } = await import('@/services/availability.service')
const toast = (await import('react-hot-toast')).default

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('availability hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useAvailability fetches with the given range', async () => {
    const slots = { data: [{ uuid: 's1' }], count: 1 }
    vi.mocked(availabilityService.list).mockResolvedValue(slots as never)
    const { result } = renderHook(() => useAvailability('2026-08-01', '2026-08-02'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(availabilityService.list).toHaveBeenCalledWith('2026-08-01', '2026-08-02')
    expect(result.current.data).toEqual(slots)
  })

  it('useAvailability fetches without a range', async () => {
    vi.mocked(availabilityService.list).mockResolvedValue({ data: [], count: 0 } as never)
    const { result } = renderHook(() => useAvailability(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(availabilityService.list).toHaveBeenCalledWith(undefined, undefined)
  })

  it('useCreateSlot creates and toasts', async () => {
    vi.mocked(availabilityService.create).mockResolvedValue({} as never)
    const { result } = renderHook(() => useCreateSlot(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ starts_at: '2026-08-01T10:00:00', ends_at: '2026-08-01T11:00:00' } as never)
    })
    expect(availabilityService.create).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Slot added.')
  })

  it('useBulkCreateSlots toasts the created count', async () => {
    vi.mocked(availabilityService.bulkCreate).mockResolvedValue({ count: 4 } as never)
    const { result } = renderHook(() => useBulkCreateSlots(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate([{ starts_at: 'x' }] as never)
    })
    expect(availabilityService.bulkCreate).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('4 slots added.')
  })

  it('useDeleteSlot removes and toasts', async () => {
    vi.mocked(availabilityService.remove).mockResolvedValue({} as never)
    const { result } = renderHook(() => useDeleteSlot(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('s1')
    })
    expect(availabilityService.remove).toHaveBeenCalledWith('s1', expect.anything())
    expect(toast.success).toHaveBeenCalledWith('Slot removed.')
  })

  it('toasts the error message on failure', async () => {
    vi.mocked(availabilityService.create).mockRejectedValue(new Error('busy'))
    const { result } = renderHook(() => useCreateSlot(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({} as never)
    })
    expect(toast.error).toHaveBeenCalledWith('busy')
  })
})
