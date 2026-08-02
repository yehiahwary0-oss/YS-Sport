import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getApiError } from '@/lib/api'
import { payoutService } from '@/services/payout.service'
import type { RequestPayoutInput } from '@/types/payout'

/** GET /coach/payments — paginated earnings list. */
export function useCoachEarnings(status?: string) {
  return useQuery({
    queryKey: ['coach', 'payments', status ?? 'all'],
    queryFn: () => payoutService.listEarnings(status),
  })
}

/** GET /coach/payments/summary. Auto-refreshes so earnings update after new payments. */
export function useCoachEarningsSummary() {
  return useQuery({
    queryKey: ['coach', 'payments', 'summary'],
    queryFn: () => payoutService.earningsSummary(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}

/** GET /coach/payouts — flat payout history (max 100, latest first). */
export function useCoachPayouts() {
  return useQuery({
    queryKey: ['coach', 'payouts', 'history'],
    queryFn: () => payoutService.history(),
  })
}

/** GET /coach/payouts/summary — earnings summary + available balance. Auto-refreshes. */
export function useCoachPayoutSummary() {
  return useQuery({
    queryKey: ['coach', 'payouts', 'summary'],
    queryFn: () => payoutService.summary(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })
}

/** POST /coach/payouts/request — request a payout from available balance. */
export function useRequestPayout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RequestPayoutInput) => payoutService.requestPayout(input),
    onSuccess: () => {
      toast.success('Payout requested successfully.')
      queryClient.invalidateQueries({ queryKey: ['coach', 'payouts'] })
      queryClient.invalidateQueries({ queryKey: ['coach', 'payments'] })
      queryClient.invalidateQueries({ queryKey: ['coach', 'earnings'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
