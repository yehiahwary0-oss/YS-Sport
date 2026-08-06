import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { serviceRequestService } from '@/services/service-request.service'
import { getApiError } from '@/lib/api'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics'

export function useCreateServiceRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { coach_uuid: string; package_uuid: string; message?: string }) =>
      serviceRequestService.create(payload),
    onSuccess: () => {
      trackEvent(ANALYTICS_EVENTS.serviceRequestSent)
      toast.success('Request sent! The coach will respond within 48 hours.')
      queryClient.invalidateQueries({ queryKey: ['athlete', 'service-requests'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useAthleteServiceRequests(status?: string) {
  return useQuery({
    queryKey: ['athlete', 'service-requests', status],
    queryFn: () => serviceRequestService.listAthlete(status),
  })
}

export function useCoachServiceRequests(status?: string) {
  return useQuery({
    queryKey: ['coach', 'service-requests', status],
    queryFn: () => serviceRequestService.listCoach(status),
  })
}

export function useServiceRequestDetail(uuid: string, role: 'athlete' | 'coach') {
  return useQuery({
    queryKey: [role, 'service-requests', uuid],
    queryFn: () => (role === 'athlete' ? serviceRequestService.getAthlete(uuid) : serviceRequestService.getCoach(uuid)),
    enabled: !!uuid,
  })
}

export function useAcceptServiceRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => serviceRequestService.accept(uuid),
    onSuccess: () => {
      trackEvent(ANALYTICS_EVENTS.bookingCreated)
      toast.success('Request accepted — booking created!')
      queryClient.invalidateQueries({ queryKey: ['coach', 'service-requests'] })
      queryClient.invalidateQueries({ queryKey: ['coach', 'bookings'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useRejectServiceRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason?: string }) =>
      serviceRequestService.reject(uuid, reason),
    onSuccess: () => {
      toast.success('Request declined.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'service-requests'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useCancelServiceRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => serviceRequestService.cancel(uuid),
    onSuccess: () => {
      toast.success('Request cancelled.')
      queryClient.invalidateQueries({ queryKey: ['athlete', 'service-requests'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
