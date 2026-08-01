import { useQuery } from '@tanstack/react-query'
import { marketplaceService } from '@/services/marketplace.service'
import type { MarketplaceFilters } from '@/types'

export function useMarketplaceSearch(filters: MarketplaceFilters) {
  return useQuery({
    queryKey: ['marketplace', 'coaches', filters],
    queryFn: () => marketplaceService.searchCoaches(filters),
    placeholderData: (prev) => prev,   // keep previous data while refetching (no flash)
  })
}

export function useFeaturedCoaches() {
  return useQuery({
    queryKey: ['marketplace', 'featured'],
    queryFn: () => marketplaceService.getFeatured(),
    staleTime: 10 * 60_000,   // 10 min — matches backend cache
  })
}

export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: () => marketplaceService.getSports(),
    staleTime: 24 * 60 * 60_000,   // 24h — reference data
  })
}

export function useCoachProfile(uuid: string) {
  return useQuery({
    queryKey: ['coach', uuid],
    queryFn: () => marketplaceService.getCoach(uuid),
    enabled: !!uuid,
  })
}

export function useCoachPackages(uuid: string) {
  return useQuery({
    queryKey: ['coach', uuid, 'packages'],
    queryFn: () => marketplaceService.getCoachPackages(uuid),
    enabled: !!uuid,
  })
}

export function useCoachReviews(uuid: string, page = 1) {
  return useQuery({
    queryKey: ['coach', uuid, 'reviews', page],
    queryFn: () => marketplaceService.getCoachReviews(uuid, page),
    enabled: !!uuid,
  })
}
