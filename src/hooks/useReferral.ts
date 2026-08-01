import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { referralService } from '@/services/referral.service'
import { getApiError } from '@/lib/api'
import toast from 'react-hot-toast'

export function useReferralInfo() {
  return useQuery({
    queryKey: ['referral'],
    queryFn: () => referralService.getReferralInfo(),
  })
}

export function useRegenerateCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => referralService.regenerateCode(),
    onSuccess: () => {
      toast.success('Referral code regenerated!')
      queryClient.invalidateQueries({ queryKey: ['referral'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
