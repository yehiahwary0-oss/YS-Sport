export const ANALYTICS_EVENTS = {
  register: 'register',
  verifyEmail: 'verify_email',
  login: 'login',
  marketplaceSearch: 'marketplace_search',
  coachProfileView: 'coach_profile_view',
  serviceRequestSent: 'service_request_sent',
  bookingCreated: 'booking_created',
  paymentInitiated: 'payment_initiated',
  paymentSuccess: 'payment_success',
  paymentFailed: 'payment_failed',
  coachVerificationSubmitted: 'coach_verification_submitted',
  coachVerificationApproved: 'coach_verification_approved',
  coachVerificationRejected: 'coach_verification_rejected',
  reviewSubmitted: 'review_submitted',
} as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? ''
export const PLAUSIBLE_API_HOST = (process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST ?? 'https://plausible.io').replace(/\/+$/, '')

type PlausibleOptions = { props?: Record<string, string | number | boolean>; callback?: () => void }
type PlausibleFn = (event: string, options?: PlausibleOptions) => void
type PlausibleWithQueue = PlausibleFn & { q?: unknown[] }
type PlausibleWindow = Window & { plausible?: PlausibleFn & { q?: unknown[] } }

export function initAnalytics(): void {
  if (typeof window === 'undefined') return
  if (!PLAUSIBLE_DOMAIN) return
  if (document.getElementById('plausible-script')) return

  const script = document.createElement('script')
  script.id = 'plausible-script'
  script.src = `${PLAUSIBLE_API_HOST}/js/script.js`
  script.defer = true
  script.async = true
  script.setAttribute('data-domain', PLAUSIBLE_DOMAIN)
  script.setAttribute('data-manual-pageviews', '')
  document.head.appendChild(script)
}

export function trackEvent(event: AnalyticsEventName | string, props?: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') return

  const w = window as PlausibleWindow
  if (typeof w.plausible !== 'function') {
    const queue: unknown[] = []
    const fn = ((name: string, options?: PlausibleOptions) => {
      queue.push([name, options])
    }) as PlausibleWithQueue
    fn.q = queue
    w.plausible = fn
  }

  w.plausible(event, props ? { props } : undefined)
}
