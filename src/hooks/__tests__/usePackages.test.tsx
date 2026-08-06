import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  usePackages,
  useCreatePackage,
  useUpdatePackage,
  useTogglePackage,
  useDeletePackage,
} from '../usePackages'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/package.service', () => ({
  packageService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    toggle: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

const { packageService } = await import('@/services/package.service')
const toast = (await import('react-hot-toast')).default

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('package hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('usePackages fetches the list', async () => {
    vi.mocked(packageService.list).mockResolvedValue([{ uuid: 'pk1' }] as never)
    const { result } = renderHook(() => usePackages(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ uuid: 'pk1' }])
  })

  it('useCreatePackage creates and toasts', async () => {
    vi.mocked(packageService.create).mockResolvedValue({ uuid: 'pk1' } as never)
    const { result } = renderHook(() => useCreatePackage(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ name: 'Monthly' } as never)
    })
    expect(packageService.create).toHaveBeenCalledWith({ name: 'Monthly' })
    expect(toast.success).toHaveBeenCalledWith('Package created.')
  })

  it('useUpdatePackage updates and toasts', async () => {
    vi.mocked(packageService.update).mockResolvedValue({ uuid: 'pk1' } as never)
    const { result } = renderHook(() => useUpdatePackage(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({ uuid: 'pk1', payload: { price: 99 } })
    })
    expect(packageService.update).toHaveBeenCalledWith('pk1', { price: 99 })
    expect(toast.success).toHaveBeenCalledWith('Package updated.')
  })

  it('useTogglePackage toggles without a toast', async () => {
    vi.mocked(packageService.toggle).mockResolvedValue({ uuid: 'pk1', is_active: true } as never)
    const { result } = renderHook(() => useTogglePackage(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('pk1')
    })
    expect(packageService.toggle).toHaveBeenCalledWith('pk1')
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('useDeletePackage removes and toasts', async () => {
    vi.mocked(packageService.remove).mockResolvedValue({} as never)
    const { result } = renderHook(() => useDeletePackage(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('pk1')
    })
    expect(packageService.remove).toHaveBeenCalledWith('pk1')
    expect(toast.success).toHaveBeenCalledWith('Package removed.')
  })

  it('toasts the error message on failure', async () => {
    vi.mocked(packageService.create).mockRejectedValue(new Error('invalid'))
    const { result } = renderHook(() => useCreatePackage(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate({} as never)
    })
    expect(toast.error).toHaveBeenCalledWith('invalid')
  })
})
