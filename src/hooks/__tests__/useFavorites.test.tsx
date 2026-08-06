import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useToggleFavorite } from '../useFavorites'
import { useFavoritesList } from '../useFavoritesList'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/services/favorite.service', () => ({
  favoriteService: {
    toggle: vi.fn(),
    list: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  getApiError: vi.fn((e: unknown) => (e as Error).message),
}))

const { favoriteService } = await import('@/services/favorite.service')
const toast = (await import('react-hot-toast')).default

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('favorite hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useToggleFavorite toasts "Added" when favoriting', async () => {
    vi.mocked(favoriteService.toggle).mockResolvedValue({ is_favorited: true } as never)
    const { result } = renderHook(() => useToggleFavorite(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('c1')
    })
    expect(favoriteService.toggle).toHaveBeenCalledWith('c1')
    expect(toast.success).toHaveBeenCalledWith('Added to favorites')
  })

  it('useToggleFavorite toasts "Removed" when unfavoriting', async () => {
    vi.mocked(favoriteService.toggle).mockResolvedValue({ is_favorited: false } as never)
    const { result } = renderHook(() => useToggleFavorite(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('c1')
    })
    expect(toast.success).toHaveBeenCalledWith('Removed from favorites')
  })

  it('useToggleFavorite toasts the error on failure', async () => {
    vi.mocked(favoriteService.toggle).mockRejectedValue(new Error('auth'))
    const { result } = renderHook(() => useToggleFavorite(), { wrapper: createWrapper() })
    await act(async () => {
      result.current.mutate('c1')
    })
    expect(toast.error).toHaveBeenCalledWith('auth')
  })

  it('useFavoritesList fetches the favorites page', async () => {
    const page = { data: [{ uuid: 'c1' }], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } }
    vi.mocked(favoriteService.list).mockResolvedValue(page as never)
    const { result } = renderHook(() => useFavoritesList(1), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(favoriteService.list).toHaveBeenCalledWith(1)
    expect(result.current.data).toEqual(page)
  })
})
