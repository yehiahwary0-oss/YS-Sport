import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useMarketplaceSearch,
  useFeaturedCoaches,
  useSports,
  useCoachProfile,
  useCoachPackages,
  useCoachReviews,
} from '../useMarketplace'

vi.mock('@/services/marketplace.service', () => ({
  marketplaceService: {
    searchCoaches: vi.fn(),
    getFeatured: vi.fn(),
    getSports: vi.fn(),
    getCoach: vi.fn(),
    getCoachPackages: vi.fn(),
    getCoachReviews: vi.fn(),
  },
}))

const { marketplaceService } = await import('@/services/marketplace.service')

const coach = { uuid: 'c1', display_name: 'Hassan' }
const page = { data: [coach], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } }

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('marketplace hooks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('useMarketplaceSearch passes filters and returns coaches', async () => {
    vi.mocked(marketplaceService.searchCoaches).mockResolvedValue(page as never)
    const filters = { sport_id: 1, search: 'ali', page: 1 }
    const { result } = renderHook(() => useMarketplaceSearch(filters), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(marketplaceService.searchCoaches).toHaveBeenCalledWith(filters)
    expect(result.current.data).toEqual(page)
  })

  it('useMarketplaceSearch keeps placeholder data across refetches', async () => {
    vi.mocked(marketplaceService.searchCoaches).mockResolvedValue(page as never)
    const { result } = renderHook(() => useMarketplaceSearch({ page: 1 }), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.data).toEqual(page))
    expect(result.current.isPlaceholderData).toBe(false)
  })

  it('useFeaturedCoaches fetches featured coaches', async () => {
    vi.mocked(marketplaceService.getFeatured).mockResolvedValue([coach] as never)
    const { result } = renderHook(() => useFeaturedCoaches(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([coach])
  })

  it('useSports fetches the sport list', async () => {
    vi.mocked(marketplaceService.getSports).mockResolvedValue([{ id: 1, name: 'Tennis' }] as never)
    const { result } = renderHook(() => useSports(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: 1, name: 'Tennis' }])
  })

  it('useCoachProfile fetches a single coach', async () => {
    vi.mocked(marketplaceService.getCoach).mockResolvedValue(coach as never)
    const { result } = renderHook(() => useCoachProfile('c1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(marketplaceService.getCoach).toHaveBeenCalledWith('c1')
  })

  it('useCoachProfile is disabled without uuid', () => {
    const { result } = renderHook(() => useCoachProfile(''), { wrapper: createWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(marketplaceService.getCoach).not.toHaveBeenCalled()
  })

  it('useCoachPackages fetches packages', async () => {
    vi.mocked(marketplaceService.getCoachPackages).mockResolvedValue([{ uuid: 'pk1' }] as never)
    const { result } = renderHook(() => useCoachPackages('c1'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(marketplaceService.getCoachPackages).toHaveBeenCalledWith('c1')
  })

  it('useCoachReviews fetches reviews with pagination', async () => {
    vi.mocked(marketplaceService.getCoachReviews).mockResolvedValue(page as never)
    const { result } = renderHook(() => useCoachReviews('c1', 2), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(marketplaceService.getCoachReviews).toHaveBeenCalledWith('c1', 2)
  })
})
