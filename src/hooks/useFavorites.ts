import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { favoriteService } from '@/services/favorite.service'
import { getApiError } from '@/lib/api'

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (coachUuid: string) => favoriteService.toggle(coachUuid),
    onSuccess: (data, coachUuid) => {
      toast.success(data.is_favorited ? 'Added to favorites' : 'Removed from favorites')

      // Optimistically update any cached marketplace/coach data
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
      queryClient.invalidateQueries({ queryKey: ['coach', coachUuid] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
