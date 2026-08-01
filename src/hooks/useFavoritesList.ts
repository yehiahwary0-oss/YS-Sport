import { useQuery } from '@tanstack/react-query'
import { favoriteService } from '@/services/favorite.service'

export function useFavoritesList(page = 1) {
  return useQuery({
    queryKey: ['favorites', page],
    queryFn: () => favoriteService.list(page),
  })
}
