// ── Enums ──────────────────────────────────────────────────────

export type UserRole = 'athlete' | 'coach' | 'admin'
export type UserStatus = 'pending' | 'active' | 'suspended'
export type CoachVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type ServiceRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'refund_pending' | 'refunded' | 'disputed' | 'failed'
export type DeliveryMode = 'online' | 'in_person' | 'both'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type ReviewStatus = 'approved' | 'pending' | 'rejected'

// ── Auth ───────────────────────────────────────────────────────

export interface AuthUser {
  uuid: string
  email: string
  role: UserRole
  status: UserStatus
  email_verified_at: string | null
}

// FIX (Contract Mismatch, found reviewing against the real
// LoginController::respondWithTokens()): the backend intentionally NEVER
// returns refresh_token in the JSON body anymore — it's set as an HttpOnly
// cookie only. Keeping refresh_token: string here was a lie to the type
// system: TypeScript would let any future code read tokens.refresh_token
// with full confidence, but the runtime value would silently be undefined.
export interface AuthTokens {
  access_token: string
  token_type: string
  expires_in: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  password_confirmation: string
  role: 'athlete' | 'coach'
  display_name: string
}

// ── Sport ──────────────────────────────────────────────────────

export interface Sport {
  id: number
  name: string
  slug: string
  icon: string | null
}

// ── Training Plans & AI Coach ─────────────────────────────────

export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced'

export type TrainingPlanGoal = 'fitness' | 'competition' | 'weight_loss' | 'muscle_gain' | 'general'

export interface TrainingPlanSession {
  day: string
  type: string
  duration: string
  intensity: string
}

export interface TrainingPlanWeek {
  week: number
  focus: string
  sessions: TrainingPlanSession[]
}

export interface TrainingPlanTemplate {
  uuid: string
  sport: { id: number; name: string; slug: string } | null
  level: TrainingLevel
  goal: TrainingPlanGoal
  title: { en: string; ar: string }
  description: { en: string; ar: string }
  duration_weeks: number
  sessions_per_week: number
  plan_structure: TrainingPlanWeek[]
  is_active: boolean
  match_type?: 'exact' | 'close' | 'generic'
  match_score?: number
}

export interface TrainingPlanMatch {
  template: TrainingPlanTemplate
  match_type: 'exact' | 'close' | 'generic'
}

export interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AiConversation {
  uuid: string
  created_at: string
  updated_at: string
  messages: AiChatMessage[]
}

export interface AiChatResponse {
  conversation_id: string
  reply: string
  suggested_questions: string[]
}

// ── Progression & Achievements ─────────────────────────────────

export interface SportProgression {
  sport: {
    id: number
    name: string
    slug: string
  }
  xp: number
  level: number
  tier: 'bronze' | 'silver' | 'gold' | 'elite'
  xp_to_next_level: number
  is_primary: boolean
}

export interface Achievement {
  uuid: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  category: string
  sport_id: number | null
  earned_at: string
}

export interface ProgressionSummary {
  total_xp: number
  total_sports: number
  primary_sport_id: number | null
}

export interface ProgressionResponse {
  data: {
    athlete: {
      uuid: string
      display_name: string
      avatar_url: string | null
    }
    summary: ProgressionSummary
    sports: SportProgression[]
    achievements: Achievement[]
  }
}

export interface AdminAthlete {
  uuid: string
  email: string
  status: string
  display_name: string | null
  avatar_url: string | null
  athlete_uuid: string | null
  sports_count: number
  created_at: string
}

export interface AdminAthleteProgression extends Omit<ProgressionResponse['data'], 'athlete'> {
  athlete: {
    uuid: string
    display_name: string
    avatar_url: string | null
    bio: string | null
    joined_at: string
  }
  summary: ProgressionSummary & {
    total_achievements: number
    total_xp_events: number
  }
}

export interface XpSource {
  uuid?: string
  status?: string
  completed_at?: string | null
  sport?: { id: number; name: string; slug: string } | null
  id?: number
  slug?: string
  name?: string
}

export interface XpEvent {
  uuid: string
  sport_id: number | null
  xp_amount: number
  source_type: string
  source_id: number | null
  reason: string
  source: XpSource | null
  created_at: string
}

export interface PublicProgressionResponse {
  data: {
    athlete: {
      uuid: string
      display_name: string
      avatar_url: string | null
      bio: string | null
    }
    sports: SportProgression[]
    achievements: Achievement[]
    joined_at: string
  }
}

// ── Profiles ───────────────────────────────────────────────────

export interface CoachProfile {
  uuid: string
  display_name: string
  bio: string | null
  years_experience: number | null
  location_city: string | null
  location_country: string | null
  avatar_path: string | null
  certificate_path: string | null
  verification_status: CoachVerificationStatus
  verified_at: string | null
  rejection_reason: string | null
  is_accepting_clients: boolean
  avg_rating: string | null
  total_reviews: number
  total_sessions: number
  profile_completion: number
  sports: Sport[]
  is_favorited?: boolean
  active_packages?: CoachPackage[]
  user?: { uuid: string; email: string } | null
  created_at: string
}

export interface AthleteProfile {
  uuid: string
  display_name: string
  bio: string | null
  avatar_path: string | null
  fitness_level: FitnessLevel | null
  goals: string | null
  date_of_birth: string | null
  sports: Sport[]
}

// ── Packages ───────────────────────────────────────────────────

export interface CoachPackage {
  uuid: string
  coach_id: number
  name: string
  description: string | null
  tier_label: 'basic' | 'standard' | 'premium' | null
  session_count: number
  session_duration_minutes: number
  delivery_mode: DeliveryMode
  price_amount: string
  price_currency: string
  is_active: boolean
  sort_order: number
}

// ── Service Requests ───────────────────────────────────────────

export interface ServiceRequest {
  uuid: string
  athlete_id: number
  coach_id: number
  package_id: number
  package_name: string
  price_amount: string
  price_currency: string
  status: ServiceRequestStatus
  athlete_message: string | null
  rejection_reason: string | null
  expires_at: string
  accepted_at: string | null
  rejected_at: string | null
  cancelled_at: string | null
  booking_id: number | null
  athlete?: AthleteProfile
  coach?: CoachProfile
  package?: CoachPackage
  booking?: Booking
  created_at: string
}

// ── Bookings ───────────────────────────────────────────────────

export interface AvailabilitySlot {
  uuid: string
  starts_at: string
  ends_at: string
  timezone: string
  is_booked: boolean
}

export interface Booking {
  uuid: string
  status: BookingStatus
  price_amount: string
  price_currency: string
  athlete_note: string | null
  coach_note: string | null
  session_link: string | null
  session_notes: string | null
  cancellation_reason: string | null
  cancelled_by: 'athlete' | 'coach' | 'admin' | null
  cancelled_at: string | null
  confirmed_at: string | null
  completed_at: string | null
  athlete?: AthleteProfile
  coach?: CoachProfile
  package?: CoachPackage
  slot?: AvailabilitySlot
  payment?: Payment
  review?: Review
  created_at: string
}

// ── Checkout / Payment Gateway ────────────────────────────────

export interface CheckoutSession {
  checkout_url: string
  transaction_id: string
  provider: string
}

// ── Payments ───────────────────────────────────────────────────

export interface Payment {
  uuid: string
  amount: string
  currency: string
  commission_rate: string
  commission_amount: string
  coach_payout: string
  status: PaymentStatus
  payment_method: string
  external_reference: string | null
  paid_at: string | null
  created_at: string
}

// ── Conversations & Messages ───────────────────────────────────

export interface Message {
  uuid: string
  conversation_id?: string
  sender_id: string | null
  body: string
  is_system: boolean
  read_at: string | null
  created_at: string
  sender?: { uuid: string; name?: string | null; avatar?: string | null }
}

export interface Conversation {
  uuid: string
  booking_id: number
  last_message_at: string | null
  unread_count?: number
  latest_message?: Message
  athlete?: AthleteProfile
  coach?: CoachProfile
  booking?: Partial<Booking>
  created_at: string
}

// ── Reviews ────────────────────────────────────────────────────

export interface Review {
  uuid: string
  rating: number
  comment: string | null
  status: ReviewStatus
  coach_reply: string | null
  coach_replied_at: string | null
  reported_at: string | null
  athlete?: AthleteProfile
  coach?: CoachProfile
  created_at: string
}

// ── Notifications ──────────────────────────────────────────────

export interface AppNotification {
  uuid: string
  type: string
  title: string
  body: string
  action_url: string | null
  read_at: string | null
  data: Record<string, unknown> | null
  created_at: string
}

// ── API Responses ──────────────────────────────────────────────

export interface ApiError {
  error: {
    code: string
    message: string
    field: string | null
    errors?: Record<string, string[]>
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

// ── Marketplace ────────────────────────────────────────────────

export type MarketplaceSort = 'relevance' | 'rating' | 'price_low_to_high' | 'price_high_to_low' | 'experience' | 'newest'

export interface MarketplaceFilters {
  q?: string
  sport_id?: number
  min_rating?: number
  country?: string
  delivery_mode?: DeliveryMode
  per_page?: number
  page?: number
  min_price?: number
  max_price?: number
  sort?: MarketplaceSort
  has_availability?: boolean
}

// ── Promo Codes ────────────────────────────────────────────────

export type DiscountType = 'percentage' | 'fixed'

export interface PromoCode {
  id: number
  code: string
  discount_type: DiscountType
  discount_value: string
  min_order_amount: string | null
  max_discount_amount: string | null
  max_uses: number | null
  used_count: number
  max_uses_per_user: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  description: string | null
  created_at: string
  updated_at: string
}

export interface PromoCodeValidation {
  code: string
  discount_type: DiscountType
  discount_value: string
  discount_amount: number
  description: string | null
}

export interface PromoCodeFormData {
  code: string
  discount_type: DiscountType
  discount_value: number
  min_order_amount?: number | null
  max_discount_amount?: number | null
  max_uses?: number | null
  max_uses_per_user?: number
  starts_at?: string | null
  expires_at?: string | null
  is_active?: boolean
  description?: string | null
}

// ── Featured Coaches ───────────────────────────────────────────

export interface FeaturedCoach {
  id: number
  coach_id: number
  position: number
  starts_at: string
  ends_at: string | null
  reason: string | null
  created_at: string
  coach?: CoachProfile
}

// ── Public Marketplace (whitelisted shapes — no internal fields) ──

export interface PublicCoachPackage {
  uuid: string
  name: string
  description: string | null
  tier_label: 'basic' | 'standard' | 'premium' | null
  session_count: number
  session_duration_minutes: number
  delivery_mode: DeliveryMode
  price_amount: string
  price_currency: string
  is_active: boolean
}

export interface MarketplaceCoach {
  uuid: string
  display_name: string
  bio: string | null
  years_experience: number | null
  location_city: string | null
  location_country: string | null
  avatar_url: string | null
  is_accepting_clients: boolean
  is_verified: boolean
  average_rating: string | null
  total_reviews: number
  total_sessions: number
  is_favorited?: boolean
  sports: Sport[]
  packages?: PublicCoachPackage[]
}

export interface PublicCoachReview {
  uuid: string
  rating: number
  comment: string | null
  coach_reply: string | null
  coach_replied_at: string | null
  created_at: string
  athlete?: { uuid: string; display_name: string; avatar_url: string | null }
}

export interface MarketplaceResponse {
  data: MarketplaceCoach[]
  meta: PaginatedResponse<MarketplaceCoach>['meta']
  filters_applied: Partial<MarketplaceFilters>
}

export interface AchievementDefinition {
  id: number
  uuid: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  category: string | null
  sport_id: number | null
  criteria: AchievementCriteria
  xp_reward: number
  sort_order: number
  is_active: boolean
  created_at: string
  sport?: Sport | null
  athlete_achievements_count?: number
}

export interface AchievementCriteria {
  type: CriteriaType
  operator?: 'gte' | 'lte' | 'eq'
  value?: number
}

export type CriteriaType = 'session_count' | 'level_reached' | 'xp_threshold' | 'sport_count' | 'admin_granted'

export interface GrantXpPayload {
  sport_id: number
  xp_amount: number
  reason?: string
}

export interface GrantXpResponse {
  status: string
  xp: number
  level: number
  previous_level: number | null
}
