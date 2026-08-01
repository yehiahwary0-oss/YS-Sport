import { api } from '@/lib/api'
import type {
  CoachProfile, CoachPackage, Review,
  AvailabilitySlot, MarketplaceFilters,
  MarketplaceResponse, Sport, PaginatedResponse,
} from '@/types'

export const marketplaceService = {

  async searchCoaches(filters: MarketplaceFilters = {}): Promise<MarketplaceResponse> {
    const { data } = await api.get('/marketplace/coaches', { params: filters })
    return data as MarketplaceResponse
  },

  async getCoach(uuid: string): Promise<CoachProfile> {
    const { data } = await api.get(`/marketplace/coaches/${uuid}`)
    return data.data as CoachProfile
  },

  async getFeatured(): Promise<CoachProfile[]> {
    const { data } = await api.get('/marketplace/featured')
    return data.data as CoachProfile[]
  },

  async getSports(): Promise<Sport[]> {
    const { data } = await api.get('/marketplace/sports')
    return data.data as Sport[]
  },

  async getCoachPackages(uuid: string): Promise<CoachPackage[]> {
    const { data } = await api.get(`/coaches/${uuid}/packages`)
    return data.data as CoachPackage[]
  },

  async getCoachAvailability(uuid: string, from: string, to: string): Promise<AvailabilitySlot[]> {
    const { data } = await api.get(`/coaches/${uuid}/availability`, { params: { from, to } })
    return data.data as AvailabilitySlot[]
  },

  async getCoachReviews(uuid: string, page = 1): Promise<PaginatedResponse<Review>> {
    const { data } = await api.get(`/coaches/${uuid}/reviews`, { params: { page } })
    return data as PaginatedResponse<Review>
  },
}
