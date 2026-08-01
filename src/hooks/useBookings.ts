import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { bookingService } from '@/services/booking.service'
import { getApiError } from '@/lib/api'

// ── Athlete ────────────────────────────────────────────────────

export function useAthleteBookings(status?: string) {
  return useQuery({
    queryKey: ['athlete', 'bookings', status],
    queryFn: () => bookingService.listAthlete(status),
  })
}

export function useAthleteBookingDetail(uuid: string) {
  return useQuery({
    queryKey: ['athlete', 'bookings', uuid],
    queryFn: () => bookingService.getAthlete(uuid),
    enabled: !!uuid,
  })
}

export function useCancelBookingAthlete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason?: string }) =>
      bookingService.cancelAthlete(uuid, reason),
    onSuccess: (_, { uuid }) => {
      toast.success('Booking cancelled.')
      queryClient.invalidateQueries({ queryKey: ['athlete', 'bookings'] })
      queryClient.invalidateQueries({ queryKey: ['athlete', 'bookings', uuid] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Coach ──────────────────────────────────────────────────────

export function useCoachBookings(status?: string) {
  return useQuery({
    queryKey: ['coach', 'bookings', status],
    queryFn: () => bookingService.listCoach(status),
  })
}

export function useCoachBookingDetail(uuid: string) {
  return useQuery({
    queryKey: ['coach', 'bookings', uuid],
    queryFn: () => bookingService.getCoach(uuid),
    enabled: !!uuid,
  })
}

export function useCompleteBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, notes }: { uuid: string; notes?: string }) => bookingService.complete(uuid, notes),
    onSuccess: () => {
      toast.success('Session marked as completed.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'bookings'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useMarkNoShow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => bookingService.markNoShow(uuid),
    onSuccess: () => {
      toast.success('Marked as no-show.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'bookings'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useCancelBookingCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason?: string }) => bookingService.cancelCoach(uuid, reason),
    onSuccess: () => {
      toast.success('Booking cancelled.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'bookings'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useSetSessionLink() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, link }: { uuid: string; link: string }) => bookingService.setSessionLink(uuid, link),
    onSuccess: (_, { uuid }) => {
      toast.success('Session link updated.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'bookings', uuid] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
