'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/push-notifications'

/**
 * Registers the PWA service worker once on the client.
 * Runs as soon as the window is interactive to keep first paint unblocked.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        registerServiceWorker().catch(() => {})
      })
      return
    }
    registerServiceWorker().catch(() => {})
  }, [])

  return null
}
