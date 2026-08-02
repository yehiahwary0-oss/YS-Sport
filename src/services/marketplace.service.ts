import { api } from '@/lib/api'
import type {
  MarketplaceCoach, PublicCoachPackage, PublicCoachReview,
  AvailabilitySlot, MarketplaceFilters,
  MarketplaceResponse, Sport, PaginatedResponse,
} from '@/types'

export const marketplaceService = {

  async searchCoaches(filters: MarketplaceFilters = {}): Promise<MarketplaceResponse> {
    const { data } = await api.get('/marketplace/coaches', { params: filters })
    return data as MarketplaceResponse
  },

  async getCoach(uuid: string): Promise<MarketplaceCoach> {
    const { data } = await api.get(`/marketplace/coaches/${uuid}`)
    return data.data as MarketplaceCoach
  },

  async getFeatured(): Promise<MarketplaceCoach[]> {
    const { data } = await api.get('/marketplace/featured')
    return data.data as MarketplaceCoach[]
  },

  async getSports(): Promise<Sport[]> {
    const { data } = await api.get('/marketplace/sports')
    return data.data as Sport[]
  },

  async getCoachPackages(uuid: string): Promise<PublicCoachPackage[]> {
    const { data } = await api.get(`/coaches/${uuid}/packages`)
    return data.data as PublicCoachPackage[]
  },

  async getCoachAvailability(uuid: string, from: string, to: string): Promise<AvailabilitySlot[]> {
    const { data } = await api.get(`/coaches/${uuid}/availability`, { params: { from, to } })
    return data.data as AvailabilitySlot[]
  },

  async getCoachReviews(uuid: string, page = 1): Promise<PaginatedResponse<PublicCoachReview>> {
    const { data } = await api.get(`/coaches/${uuid}/reviews`, { params: { page } })
    return data.data as PaginatedResponse<PublicCoachReview>
  },
}
