'use client'

import { useState, useEffect } from 'react'
import * as ReactDOM from 'react-dom'
import React from 'react'
import { useRouter } from '@/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { MotionConfig } from 'framer-motion'
import { Spinner } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/auth.store'
import { ServiceWorkerRegister } from '@/components/shared/ServiceWorkerRegister'
import { OfflineBanner } from '@/components/shared/OfflineBanner'
import { InstallPWA } from '@/components/shared/InstallPWA'
import { PageTransition } from '@/components/shared/PageTransition'
import { ScrollProgressBar } from '@/components/shared/ScrollProgressBar'
import { SkipToContent } from '@/components/shared/SkipToContent'
import { useScrollToTop } from '@/hooks/useScrollToTop'
import { unsubscribeFromPush } from '@/lib/push-notifications'

function A11yAudit() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    let disposed = false
    import('@axe-core/react')
      .then(({ default: axe }) => {
        if (disposed) return
        void axe(React, ReactDOM, 1000)
      })
      .catch(() => {})
    return () => {
      disposed = true
    }
  }, [])

  return null
}

function ScrollRestorer() {
  useScrollToTop()
  return null
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const fetchUser = useAuthStore((s) => s.fetchUser)
  const setUser = useAuthStore((s) => s.setUser)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    const handleLogout = () => {
      unsubscribeFromPush().catch(() => {})
      setUser(null)
      router.replace('/auth/login')
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [router, setUser])

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy-900">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <SkipToContent />
        <AuthInitializer>
          <PageTransition>{children}</PageTransition>
        </AuthInitializer>
        <ScrollRestorer />
        <ScrollProgressBar />
        <A11yAudit />
        <ServiceWorkerRegister />
        <OfflineBanner />
        <InstallPWA />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b',
              color: '#fafafa',
              border: '1px solid #27272a',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#18181b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#18181b' } },
          }}
        />
      </QueryClientProvider>
    </MotionConfig>
  )
}
