import { api } from '@/lib/api'
import type { CoachProfile, PaginatedResponse } from '@/types'

export const favoriteService = {

  async list(page = 1): Promise<PaginatedResponse<CoachProfile>> {
    const { data } = await api.get('/athlete/favorites', { params: { page } })
    return data as PaginatedResponse<CoachProfile>
  },

  async toggle(coachUuid: string): Promise<{ is_favorited: boolean }> {
    const { data } = await api.post(`/favorites/coaches/${coachUuid}`)
    return data as { is_favorited: boolean }
  },

  async remove(coachUuid: string): Promise<void> {
    await api.delete(`/favorites/coaches/${coachUuid}`)
  },
}
