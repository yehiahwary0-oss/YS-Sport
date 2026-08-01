import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { availabilityService } from '@/services/availability.service'
import { getApiError } from '@/lib/api'

export function useAvailability(from?: string, to?: string) {
  return useQuery({
    queryKey: ['coach', 'availability', from, to],
    queryFn: () => availabilityService.list(from, to),
  })
}

export function useCreateSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: availabilityService.create,
    onSuccess: () => {
      toast.success('Slot added.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'availability'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useBulkCreateSlots() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: availabilityService.bulkCreate,
    onSuccess: (data) => {
      toast.success(`${data.count} slots added.`)
      queryClient.invalidateQueries({ queryKey: ['coach', 'availability'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useDeleteSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: availabilityService.remove,
    onSuccess: () => {
      toast.success('Slot removed.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'availability'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
