import { afterEach, describe, expect, it, vi } from 'vitest'

const SCRIPT_ID = 'plausible-script'

async function loadAnalytics(env: Record<string, string>) {
  vi.resetModules()
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value
  }
  return await import('@/lib/analytics')
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  delete process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST
  document.getElementById(SCRIPT_ID)?.remove()
  delete (window as unknown as Record<string, unknown>).plausible
})

describe('analytics events', () => {
  it('defines all required events with the exact names', async () => {
    const { ANALYTICS_EVENTS } = await loadAnalytics({})
    expect(Object.values(ANALYTICS_EVENTS)).toEqual([
      'register',
      'verify_email',
      'login',
      'marketplace_search',
      'coach_profile_view',
      'service_request_sent',
      'booking_created',
      'payment_initiated',
      'payment_success',
      'payment_failed',
      'coach_verification_submitted',
      'coach_verification_approved',
      'coach_verification_rejected',
      'review_submitted',
    ])
  })

  it('forwards events with props to window.plausible', async () => {
    const { ANALYTICS_EVENTS, trackEvent } = await loadAnalytics({})
    const plausible = vi.fn()
    ;(window as unknown as { plausible: unknown }).plausible = plausible

    trackEvent(ANALYTICS_EVENTS.register, { role: 'athlete' })

    expect(plausible).toHaveBeenCalledWith('register', { props: { role: 'athlete' } })
  })

  it('calls window.plausible without props when none are given', async () => {
    const { trackEvent } = await loadAnalytics({})
    const plausible = vi.fn()
    ;(window as unknown as { plausible: unknown }).plausible = plausible

    trackEvent('payment_success')

    expect(plausible).toHaveBeenCalledWith('payment_success', undefined)
  })

  it('queues events when the Plausible script has not loaded yet', async () => {
    const { trackEvent } = await loadAnalytics({})
    delete (window as unknown as Record<string, unknown>).plausible

    trackEvent('login')

    const w = window as unknown as { plausible: { q?: unknown[] } }
    expect(Array.isArray(w.plausible.q)).toBe(true)
    expect(w.plausible.q).toHaveLength(1)
    expect((w.plausible.q as unknown[][])[0][0]).toBe('login')
  })

  it('does not throw when the script loader is absent', async () => {
    const { trackEvent } = await loadAnalytics({})
    trackEvent('login')
    expect((window as unknown as { plausible: unknown }).plausible).toBeDefined()
  })
})

describe('initAnalytics', () => {
  it('does not load the script when no domain is configured', async () => {
    const { initAnalytics } = await loadAnalytics({})
    initAnalytics()
    expect(document.getElementById(SCRIPT_ID)).toBeNull()
  })

  it('injects the Plausible script with domain and manual pageviews', async () => {
    const { initAnalytics } = await loadAnalytics({ NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'yssports.com' })

    initAnalytics()

    const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement
    expect(script).not.toBeNull()
    expect(script.src).toBe('https://plausible.io/js/script.js')
    expect(script.defer).toBe(true)
    expect(script.getAttribute('data-domain')).toBe('yssports.com')
    expect(script.getAttribute('data-manual-pageviews')).toBe('')
  })

  it('uses a custom API host when configured', async () => {
    const { initAnalytics } = await loadAnalytics({
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'yssports.com',
      NEXT_PUBLIC_PLAUSIBLE_API_HOST: 'https://plausible.example.com/',
    })

    initAnalytics()

    const script = document.getElementById(SCRIPT_ID) as HTMLScriptElement
    expect(script.src).toBe('https://plausible.example.com/js/script.js')
  })

  it('is idempotent and never duplicates the script tag', async () => {
    const { initAnalytics } = await loadAnalytics({ NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'yssports.com' })

    initAnalytics()
    initAnalytics()

    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1)
  })
})
