import { describe, it, expect, vi, beforeEach } from 'vitest'
import { marketplaceService } from '../marketplace.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}))

const { api } = await import('@/lib/api')

const coach = { uuid: 'c1', display_name: 'Hassan' }
const pageEnvelope = {
  data: { data: { data: [coach], current_page: 1, per_page: 15, last_page: 1, total: 1 } },
}

describe('marketplaceService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('searchCoaches passes filters and returns the raw envelope', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: pageEnvelope })
    const filters = { sport_id: 1, search: 'ali', page: 1 }

    await expect(marketplaceService.searchCoaches(filters)).resolves.toEqual(pageEnvelope)
    expect(api.get).toHaveBeenCalledWith('/marketplace/coaches', { params: filters })
  })

  it('searchCoaches defaults to empty filters', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: pageEnvelope })
    await marketplaceService.searchCoaches()
    expect(api.get).toHaveBeenCalledWith('/marketplace/coaches', { params: {} })
  })

  it('getCoach unwraps by uuid', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: coach } })
    await expect(marketplaceService.getCoach('c1')).resolves.toEqual(coach)
    expect(api.get).toHaveBeenCalledWith('/marketplace/coaches/c1')
  })

  it('getFeatured returns the flat array', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [coach] } })
    await expect(marketplaceService.getFeatured()).resolves.toEqual([coach])
    expect(api.get).toHaveBeenCalledWith('/marketplace/featured')
  })

  it('getSports returns the flat array', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [{ id: 1, name: 'Tennis' }] } })
    await expect(marketplaceService.getSports()).resolves.toEqual([{ id: 1, name: 'Tennis' }])
    expect(api.get).toHaveBeenCalledWith('/marketplace/sports')
  })

  it('getCoachPackages unwraps', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [{ uuid: 'pk1' }] } })
    await expect(marketplaceService.getCoachPackages('c1')).resolves.toEqual([{ uuid: 'pk1' }])
    expect(api.get).toHaveBeenCalledWith('/coaches/c1/packages')
  })

  it('getCoachAvailability passes from/to params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [{ uuid: 's1' }] } })
    await marketplaceService.getCoachAvailability('c1', '2026-08-01', '2026-08-02')
    expect(api.get).toHaveBeenCalledWith('/coaches/c1/availability', {
      params: { from: '2026-08-01', to: '2026-08-02' },
    })
  })

  it('getCoachReviews unwraps a paginated envelope', async () => {
    const metaEnvelope = { data: { data: { data: [coach], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } } } }
    vi.mocked(api.get).mockResolvedValue(metaEnvelope)
    const result = await marketplaceService.getCoachReviews('c1', 2)
    expect(api.get).toHaveBeenCalledWith('/coaches/c1/reviews', { params: { page: 2 } })
    expect(result.meta.total).toBe(1)
  })

  it('rejects on error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('net'))
    await expect(marketplaceService.getSports()).rejects.toThrow('net')
  })
})
