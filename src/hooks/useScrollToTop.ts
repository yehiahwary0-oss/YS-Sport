'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Smooth-scrolls to the top on every route change.
 * The App Router preserves scroll position across navigations,
 * so this restores the expected top-of-page behaviour.
 */
export function useScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
}
