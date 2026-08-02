import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingService } from '@/services/booking.service'

const POLL_INTERVAL_MS = 3_000
const POLL_TIMEOUT_MS = 30_000

/**
 * Polls the athlete booking detail while its payment is still pending.
 * Stops as soon as the payment leaves the pending state or after 30s (timedOut).
 * On settlement, invalidates the booking queries so pages refresh automatically.
 */
export function useBookingPayment(uuid: string, enabled: boolean) {
  const queryClient = useQueryClient()
  const startedAtRef = useRef(Date.now())
  const prevStatusRef = useRef<string | null>(null)

  const query = useQuery({
    queryKey: ['bookingPayment', uuid],
    queryFn: () => bookingService.getAthlete(uuid),
    enabled,
    refetchInterval: (q) => {
      const status = q.state.data?.payment?.status
      if (status !== 'pending') return false
      if (Date.now() - startedAtRef.current >= POLL_TIMEOUT_MS) return false
      return POLL_INTERVAL_MS
    },
  })

  const status = query.data?.payment?.status ?? null
  const timedOut = enabled && status === 'pending' && Date.now() - startedAtRef.current >= POLL_TIMEOUT_MS

  useEffect(() => {
    const prev = prevStatusRef.current
    if (prev === 'pending' && status !== 'pending') {
      queryClient.invalidateQueries({ queryKey: ['athlete', 'bookings', uuid] })
      queryClient.invalidateQueries({ queryKey: ['athlete', 'bookings'] })
    }
    prevStatusRef.current = status
  }, [queryClient, status, uuid])

  return { ...query, timedOut }
}
