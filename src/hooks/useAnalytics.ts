import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  ANALYTICS_EVENTS,
  PLAUSIBLE_DOMAIN,
  trackEvent,
} from '@/lib/analytics'

export function useAnalytics() {
  return { track: trackEvent, EVENTS: ANALYTICS_EVENTS }
}

export function useTrackPageView(): void {
  const pathname = usePathname()

  useEffect(() => {
    if (!PLAUSIBLE_DOMAIN) return
    trackEvent('pageview')
  }, [pathname])
}
