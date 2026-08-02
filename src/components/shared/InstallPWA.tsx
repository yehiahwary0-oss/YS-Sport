'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download } from 'lucide-react'
import { isStandalonePwa } from '@/lib/push-notifications'

const DISMISS_KEY = 'ys-install-dismissed-at'
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const isMobileOrTablet = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches

/**
 * PWA install prompt — mobile/tablet only, dismissible for 7 days.
 * Not shown while already running as an installed PWA.
 */
export function InstallPWA() {
  const t = useTranslations('common')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalonePwa()) return

    const stored = localStorage.getItem(DISMISS_KEY)
    if (stored && Date.now() - Number(stored) < DISMISS_TTL_MS) return

    const show = () => {
      if (isMobileOrTablet()) setVisible(true)
    }

    const handlePrompt = (event: Event) => {
      event.preventDefault()
      const promptEvent = event as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      show()
    }

    const handleInstalled = () => {
      setVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    window.addEventListener('resize', show)
    show()

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('resize', show)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    } else {
      dismiss()
    }
    setDeferredPrompt(null)
  }

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  if (!visible || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-4 shadow-xl backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100">{t('installTitle')}</p>
          <p className="truncate text-xs text-zinc-400">{t('installDescription')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
          >
            {t('dismiss')}
          </button>
          <button
            type="button"
            onClick={install}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {t('install')}
          </button>
        </div>
      </div>
    </div>
  )
}
