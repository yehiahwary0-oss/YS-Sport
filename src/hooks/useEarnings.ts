import { useQuery } from '@tanstack/react-query'
import { paymentService } from '@/services/payment.service'

export function useEarningsSummary() {
  return useQuery({
    queryKey: ['coach', 'earnings', 'summary'],
    queryFn: () => paymentService.summary(),
  })
}

export function useCoachPayments(status?: string) {
  return useQuery({
    queryKey: ['coach', 'payments', status],
    queryFn: () => paymentService.listCoach(status),
  })
}
