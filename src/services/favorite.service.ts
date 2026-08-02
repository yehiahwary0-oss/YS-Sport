import { api } from '@/lib/api'
import type { MarketplaceCoach, PaginatedResponse } from '@/types'

export const favoriteService = {

  async list(page = 1): Promise<PaginatedResponse<MarketplaceCoach>> {
    const { data } = await api.get('/athlete/favorites', { params: { page } })
    return data.data as PaginatedResponse<MarketplaceCoach>
  },

  async toggle(coachUuid: string): Promise<{ is_favorited: boolean }> {
    const { data } = await api.post(`/favorites/coaches/${coachUuid}`)
    return data as { is_favorited: boolean }
  },

  async remove(coachUuid: string): Promise<void> {
    await api.delete(`/favorites/coaches/${coachUuid}`)
  },
}
