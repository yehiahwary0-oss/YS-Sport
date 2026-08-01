'use client'

import { useEffect } from 'react'
import { useRouter } from '@/navigation'
import { useAuthStore } from '@/store/auth.store'
import { FullPageSpinner } from '@/components/ui/Spinner'
import type { UserRole } from '@/types'

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  useEffect(() => {
    if (!isInitialized) return

    if (!user) {
      router.replace('/auth/login')
      return
    }

    if (!allowedRoles.includes(user.role)) {
      const fallback = user.role === 'coach' ? '/coach/dashboard' : '/athlete/dashboard'
      router.replace(fallback)
    }
  }, [user, isInitialized, allowedRoles, router])

  if (!isInitialized || !user || !allowedRoles.includes(user.role)) {
    return <FullPageSpinner />
  }

  return <>{children}</>
}
