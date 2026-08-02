import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminService, type AdminAthletesFilters, type AdminBookingsFilters, type AdminCoachesFilters, type AdminPaymentsFilters, type AdminPayoutsFilters, type AdminReviewsFilters, type AdminUsersFilters } from '@/services/admin.service'
import { getApiError } from '@/lib/api'

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: () => adminService.metrics(),
    refetchInterval: 60_000,
  })
}

export function useAdminAuditLogs(limit = 10) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', limit],
    queryFn: () => adminService.auditLogs(limit),
    refetchInterval: 60_000,
  })
}

// ── Coach verification ───────────────────────────────────────

export function usePendingCoaches() {
  return useQuery({
    queryKey: ['admin', 'coaches', 'pending'],
    queryFn: () => adminService.pendingCoaches(),
  })
}

export function useAdminCoaches(params: AdminCoachesFilters) {
  return useQuery({
    queryKey: ['admin', 'coaches', params],
    queryFn: () => adminService.listCoaches(params),
  })
}

export function useVerifyCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => adminService.verifyCoach(uuid),
    onSuccess: () => {
      toast.success('Coach verified.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'coaches'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useRejectCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) => adminService.rejectCoach(uuid, reason),
    onSuccess: () => {
      toast.success('Coach application rejected.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'coaches'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Payments ──────────────────────────────────────────────────

export function usePendingPayments() {
  return useQuery({
    queryKey: ['admin', 'payments', 'pending'],
    queryFn: () => adminService.pendingPayments(),
  })
}

export function useAdminPayments(params: AdminPaymentsFilters) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => adminService.allPayments(params),
  })
}

export function useAdminPayouts(params: AdminPayoutsFilters) {
  return useQuery({
    queryKey: ['admin', 'payouts', params],
    queryFn: () => adminService.listPayouts(params),
  })
}

export function useConfirmPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, externalReference }: { uuid: string; externalReference?: string }) =>
      adminService.confirmPayment(uuid, externalReference),
    onSuccess: () => {
      toast.success('Payment confirmed.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useRefundPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) => adminService.refundPayment(uuid, reason),
    onSuccess: (data) => {
      toast.success(data.message ?? 'Payment refunded.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Users ─────────────────────────────────────────────────────

export function useAdminUsers(params: AdminUsersFilters) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.listUsers(params),
  })
}

export function useSuspendUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) => adminService.suspendUser(uuid, reason),
    onSuccess: () => {
      toast.success('User suspended.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useReactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => adminService.reactivateUser(uuid),
    onSuccess: () => {
      toast.success('User reactivated.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Bookings oversight ────────────────────────────────────────

export function useAdminBookings(params: AdminBookingsFilters) {
  return useQuery({
    queryKey: ['admin', 'bookings', params],
    queryFn: () => adminService.listBookings(params),
  })
}

export function useForceCompleteBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) => adminService.forceCompleteBooking(uuid, reason),
    onSuccess: () => {
      toast.success('Booking marked as completed.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Reviews moderation ────────────────────────────────────────

export function useAdminReviews(params: AdminReviewsFilters) {
  return useQuery({
    queryKey: ['admin', 'reviews', params],
    queryFn: () => adminService.listReviews(params),
  })
}

export function useApproveReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => adminService.approveReview(uuid),
    onSuccess: () => {
      toast.success('Review approved.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useRejectReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason: string }) => adminService.rejectReview(uuid, reason),
    onSuccess: () => {
      toast.success('Review rejected.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Featured Coaches ───────────────────────────────────────────

export function useFeaturedCoachesAdmin() {
  return useQuery({
    queryKey: ['admin', 'featured-coaches'],
    queryFn: () => adminService.listFeaturedCoaches(),
  })
}

export function useCreateFeaturedCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof adminService.createFeaturedCoach>[0]) =>
      adminService.createFeaturedCoach(payload),
    onSuccess: () => {
      toast.success('Featured coach added.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured-coaches'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useUpdateFeaturedCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Parameters<typeof adminService.updateFeaturedCoach>[1]) =>
      adminService.updateFeaturedCoach(id, payload),
    onSuccess: () => {
      toast.success('Featured coach updated.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured-coaches'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useDeleteFeaturedCoach() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminService.deleteFeaturedCoach(id),
    onSuccess: () => {
      toast.success('Featured coach removed.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured-coaches'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Promo Codes ────────────────────────────────────────────────

export function usePromoCodesAdmin() {
  return useQuery({
    queryKey: ['admin', 'promo-codes'],
    queryFn: () => adminService.listPromoCodes(),
  })
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof adminService.createPromoCode>[0]) =>
      adminService.createPromoCode(payload),
    onSuccess: () => {
      toast.success('Promo code created.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Parameters<typeof adminService.updatePromoCode>[1]) =>
      adminService.updatePromoCode(id, payload),
    onSuccess: () => {
      toast.success('Promo code updated.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useTogglePromoCodeStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminService.togglePromoCodeStatus(id),
    onSuccess: () => {
      toast.success('Promo code status toggled.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Achievement definitions ──────────────────────────────────────

export function useAdminAchievements(params: {
  page?: number
  search?: string
  is_active?: boolean
  criteria_type?: string
  sport_id?: number | 'null'
  sort?: string
  dir?: string
}) {
  return useQuery({
    queryKey: ['admin', 'achievements', params],
    queryFn: () => adminService.listAchievements(params),
  })
}

export function useCreateAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof adminService.createAchievement>[0]) =>
      adminService.createAchievement(payload),
    onSuccess: () => {
      toast.success('Achievement created.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'achievements'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Partial<Parameters<typeof adminService.updateAchievement>[1]>) =>
      adminService.updateAchievement(id, payload),
    onSuccess: () => {
      toast.success('Achievement updated.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'achievements'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useToggleAchievementStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminService.toggleAchievementStatus(id),
    onSuccess: () => {
      toast.success('Achievement status updated.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'achievements'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => adminService.deletePromoCode(id),
    onSuccess: () => {
      toast.success('Promo code deleted.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

// ── Manual Achievement Grant ─────────────────────────────────────

// ── Athlete List & Progression ──────────────────────────────────

export function useAdminAthletes(params: AdminAthletesFilters) {
  return useQuery({
    queryKey: ['admin', 'athletes', params],
    queryFn: () => adminService.listAthletes(params),
  })
}

export function useAdminAthleteProgression(athleteUuid: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'athlete-progression', athleteUuid],
    queryFn: () => adminService.getAthleteProgression(athleteUuid!),
    enabled: !!athleteUuid,
  })
}

export function useAdminAthleteXpEvents(athleteUuid: string | undefined, params?: { page?: number }) {
  return useQuery({
    queryKey: ['admin', 'athlete-xp-events', athleteUuid, params],
    queryFn: () => adminService.getAthleteXpEvents(athleteUuid!, params),
    enabled: !!athleteUuid,
  })
}

export function useGrantXp(athleteUuid: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof adminService.grantXp>[1]) =>
      adminService.grantXp(athleteUuid!, payload),
    onSuccess: (data) => {
      if (data.status === 'awarded') {
        toast.success('XP granted successfully.')
      } else {
        toast('XP already granted.')
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'athlete-progression', athleteUuid] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'athlete-xp-events', athleteUuid] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}

export function useGrantAchievement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ achievementId, athleteId }: { achievementId: number; athleteId: number }) =>
      adminService.grantAchievement(achievementId, athleteId),
    onSuccess: (data) => {
      if (data.status === 'awarded') {
        toast.success('Achievement granted to athlete.')
      } else {
        toast('Athlete already earned this achievement.')
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'achievements'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
