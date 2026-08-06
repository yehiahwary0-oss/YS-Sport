import { describe, it, expect, vi, beforeEach } from 'vitest'
import { favoriteService } from '../favorite.service'

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

const { api } = await import('@/lib/api')

describe('favoriteService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('list paginates', async () => {
    const envelope = { data: { data: { data: [{ uuid: 'c1' }], meta: { current_page: 1, per_page: 15, last_page: 1, total: 1 } } } }
    vi.mocked(api.get).mockResolvedValue(envelope)

    const result = await favoriteService.list(2)

    expect(api.get).toHaveBeenCalledWith('/athlete/favorites', { params: { page: 2 } })
    expect(result.meta.total).toBe(1)
  })

  it('toggle POSTs the coach uuid and returns the raw payload', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { is_favorited: true } })
    await expect(favoriteService.toggle('c1')).resolves.toEqual({ is_favorited: true })
    expect(api.post).toHaveBeenCalledWith('/favorites/coaches/c1')
  })

  it('remove DELETEs the coach uuid', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: {} })
    await favoriteService.remove('c1')
    expect(api.delete).toHaveBeenCalledWith('/favorites/coaches/c1')
  })

  it('rejects on error', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('down'))
    await expect(favoriteService.list()).rejects.toThrow('down')
  })
})
