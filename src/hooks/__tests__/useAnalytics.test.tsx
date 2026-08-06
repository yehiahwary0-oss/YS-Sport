import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAnalytics, useTrackPageView } from '../useAnalytics'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/en/marketplace'),
}))

const analyticsMock = vi.hoisted(() => ({
  ANALYTICS_EVENTS: { testEvent: 'test_event' },
  PLAUSIBLE_DOMAIN: undefined as string | undefined,
  trackEvent: vi.fn(),
}))

vi.mock('@/lib/analytics', () => analyticsMock)

const { usePathname } = await import('next/navigation')

describe('useAnalytics', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exposes the track function and events', () => {
    const { result } = renderHook(() => useAnalytics())
    result.current.track('pageview')
    expect(analyticsMock.trackEvent).toHaveBeenCalledWith('pageview')
    expect(result.current.EVENTS).toEqual({ testEvent: 'test_event' })
  })
})

describe('useTrackPageView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does not track when no domain is configured', () => {
    analyticsMock.PLAUSIBLE_DOMAIN = undefined
    renderHook(() => useTrackPageView())
    expect(analyticsMock.trackEvent).not.toHaveBeenCalled()
  })

  it('tracks a pageview on mount when the domain is configured', () => {
    analyticsMock.PLAUSIBLE_DOMAIN = 'analytics.example.com'
    renderHook(() => useTrackPageView())
    expect(analyticsMock.trackEvent).toHaveBeenCalledWith('pageview')
  })

  it('re-tracks when the pathname changes', () => {
    analyticsMock.PLAUSIBLE_DOMAIN = 'analytics.example.com'
    const { rerender } = renderHook(() => useTrackPageView())
    expect(analyticsMock.trackEvent).toHaveBeenCalledTimes(1)

    vi.mocked(usePathname).mockReturnValue('/en/coaches/c1')
    rerender()

    expect(analyticsMock.trackEvent).toHaveBeenCalledTimes(2)
  })
})
