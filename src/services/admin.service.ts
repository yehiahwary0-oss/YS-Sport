import { api } from '@/lib/api'
import type { AchievementDefinition, CoachProfile, Payment, Booking, Review, FeaturedCoach, PromoCode, PromoCodeFormData, PaginatedResponse, AdminAthlete, AdminAthleteProgression, XpEvent, GrantXpPayload, GrantXpResponse } from '@/types'

export interface AdminMetrics {
  users: { new_7d: number; new_30d: number; total: number }
  coaches: { pending_verification: number; verified: number }
  service_requests: { pending: number; total: number }
  bookings: { active: number; completed_total: number; completion_rate: string }
  revenue: { this_month: string; pending: string }
}

export interface AdminUser {
  uuid: string
  email: string
  role: string
  status: string
  created_at: string
}

export const adminService = {

  async metrics(): Promise<AdminMetrics> {
    const { data } = await api.get('/admin/metrics')
    return data.data as AdminMetrics
  },

  // ── Coach verification ─────────────────────────────────────
  async pendingCoaches(page = 1): Promise<PaginatedResponse<CoachProfile>> {
    const { data } = await api.get('/admin/coaches/pending-verification', { params: { page } })
    return data as PaginatedResponse<CoachProfile>
  },

  async verifyCoach(uuid: string): Promise<void> {
    await api.put(`/admin/coaches/${uuid}/verify`)
  },

  async rejectCoach(uuid: string, reason: string): Promise<void> {
    await api.put(`/admin/coaches/${uuid}/reject`, { reason })
  },

  // ── Payments ────────────────────────────────────────────────
  async pendingPayments(page = 1): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get('/admin/payments/pending', { params: { page } })
    return data as PaginatedResponse<Payment>
  },

  async allPayments(status?: string, page = 1): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get('/admin/payments', { params: { status, page } })
    return data as PaginatedResponse<Payment>
  },

  async confirmPayment(uuid: string, externalReference?: string): Promise<void> {
    await api.put(`/admin/payments/${uuid}/confirm`, { external_reference: externalReference })
  },

  async refundPayment(uuid: string, reason: string): Promise<void> {
    await api.put(`/admin/payments/${uuid}/refund`, { reason })
  },

  // ── Users ───────────────────────────────────────────────────
  async listUsers(params: { role?: string; status?: string; search?: string; page?: number }): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await api.get('/admin/users', { params })
    return data as PaginatedResponse<AdminUser>
  },

  async suspendUser(uuid: string, reason: string): Promise<void> {
    await api.put(`/admin/users/${uuid}/suspend`, { reason })
  },

  async reactivateUser(uuid: string): Promise<void> {
    await api.put(`/admin/users/${uuid}/reactivate`)
  },

  // ── Bookings oversight ──────────────────────────────────────
  async listBookings(params: { status?: string; page?: number }): Promise<PaginatedResponse<Booking>> {
    const { data } = await api.get('/admin/bookings', { params })
    return data as PaginatedResponse<Booking>
  },

  async forceCompleteBooking(uuid: string, reason: string): Promise<void> {
    await api.put(`/admin/bookings/${uuid}/force-complete`, { reason })
  },

  // ── Reviews moderation ──────────────────────────────────────
  async listReviews(params: { status?: string; reported?: boolean; page?: number }): Promise<PaginatedResponse<Review>> {
    const { data } = await api.get('/admin/reviews', { params })
    return data as PaginatedResponse<Review>
  },

  async approveReview(uuid: string): Promise<void> {
    await api.put(`/admin/reviews/${uuid}/approve`)
  },

  async rejectReview(uuid: string, reason: string): Promise<void> {
    await api.put(`/admin/reviews/${uuid}/reject`, { reason })
  },

  // ── Featured Coaches ────────────────────────────────────────
  async listFeaturedCoaches(): Promise<FeaturedCoach[]> {
    const { data } = await api.get('/admin/featured-coaches')
    return data.data as FeaturedCoach[]
  },

  async createFeaturedCoach(payload: {
    coach_id: number
    position: number
    starts_at: string
    ends_at?: string | null
    reason?: string | null
  }): Promise<FeaturedCoach> {
    const { data } = await api.post('/admin/featured-coaches', payload)
    return data.data as FeaturedCoach
  },

  async updateFeaturedCoach(id: number, payload: {
    position?: number
    starts_at?: string
    ends_at?: string | null
    reason?: string | null
  }): Promise<FeaturedCoach> {
    const { data } = await api.put(`/admin/featured-coaches/${id}`, payload)
    return data.data as FeaturedCoach
  },

  async deleteFeaturedCoach(id: number): Promise<void> {
    await api.delete(`/admin/featured-coaches/${id}`)
  },

  // ── Promo Codes ─────────────────────────────────────────────
  async listPromoCodes(): Promise<PromoCode[]> {
    const { data } = await api.get('/admin/promo-codes')
    return data.data as PromoCode[]
  },

  async createPromoCode(payload: PromoCodeFormData): Promise<PromoCode> {
    const { data } = await api.post('/admin/promo-codes', payload)
    return data.data as PromoCode
  },

  async updatePromoCode(id: number, payload: Partial<PromoCodeFormData>): Promise<PromoCode> {
    const { data } = await api.put(`/admin/promo-codes/${id}`, payload)
    return data.data as PromoCode
  },

  async togglePromoCodeStatus(id: number): Promise<PromoCode> {
    const { data } = await api.put(`/admin/promo-codes/${id}/toggle-status`)
    return data.data as PromoCode
  },

  async deletePromoCode(id: number): Promise<void> {
    await api.delete(`/admin/promo-codes/${id}`)
  },

  // ── Achievement definitions ─────────────────────────────────
  async listAchievements(params: {
    page?: number
    search?: string
    is_active?: boolean
    criteria_type?: string
    sport_id?: number | 'null'
    sort?: string
    dir?: string
    per_page?: number
  }): Promise<PaginatedResponse<AchievementDefinition>> {
    const { data } = await api.get('/admin/achievements', { params })
    return data as PaginatedResponse<AchievementDefinition>
  },

  async getAchievement(id: number): Promise<AchievementDefinition> {
    const { data } = await api.get(`/admin/achievements/${id}`)
    return data.data as AchievementDefinition
  },

  async createAchievement(payload: AchievementFormData): Promise<AchievementDefinition> {
    const { data } = await api.post('/admin/achievements', payload)
    return data.data as AchievementDefinition
  },

  async updateAchievement(id: number, payload: Partial<AchievementFormData>): Promise<AchievementDefinition> {
    const { data } = await api.put(`/admin/achievements/${id}`, payload)
    return data.data as AchievementDefinition
  },

  async toggleAchievementStatus(id: number): Promise<AchievementDefinition> {
    const { data } = await api.patch(`/admin/achievements/${id}/status`)
    return data.data as AchievementDefinition
  },

  async grantAchievement(achievementId: number, athleteId: number): Promise<{ status: string }> {
    const { data } = await api.post(`/admin/achievements/${achievementId}/grant`, { athlete_id: athleteId })
    return data.data as { status: string }
  },

  // ── Athlete List & Progression ───────────────────────────────
  async listAthletes(params: { search?: string; status?: string; page?: number }): Promise<PaginatedResponse<AdminAthlete>> {
    const { data } = await api.get('/admin/athletes', { params })
    return data as PaginatedResponse<AdminAthlete>
  },

  async getAthleteProgression(athleteUuid: string): Promise<AdminAthleteProgression> {
    const { data } = await api.get(`/admin/athletes/${athleteUuid}/progression`)
    return data.data as AdminAthleteProgression
  },

  async getAthleteXpEvents(athleteUuid: string, params: { page?: number; per_page?: number } = {}): Promise<PaginatedResponse<XpEvent>> {
    const { data } = await api.get(`/admin/athletes/${athleteUuid}/progression/xp-events`, { params })
    return data as PaginatedResponse<XpEvent>
  },

  async grantXp(athleteUuid: string, payload: GrantXpPayload): Promise<GrantXpResponse> {
    const { data } = await api.post(`/admin/athletes/${athleteUuid}/progression/award-xp`, payload)
    return data.data as GrantXpResponse
  },
}

export interface AchievementFormData {
  slug: string
  name: string
  description?: string | null
  icon?: string | null
  category?: string | null
  sport_id?: number | null
  criteria_type: string
  criteria?: {
    operator?: string
    value?: number
  }
  xp_reward?: number
  sort_order?: number
  is_active?: boolean
}
