import { create } from 'zustand'
import type { AuthUser } from '@/types'
import { authService } from '@/services/auth.service'
import { tokenStore } from '@/lib/api'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isInitialized: boolean

  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  setUser: (user: AuthUser | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { user } = await authService.login({ email, password })
      set({ user, isLoading: false, isInitialized: true })
      trackEvent(ANALYTICS_EVENTS.login)
      return user
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: async () => {
    await authService.logout()
    set({ user: null })
  },

  fetchUser: async () => {
    set({ isLoading: true })
    try {
      const user = await authService.me()
      set({ user, isLoading: false, isInitialized: true })
    } catch {
      tokenStore.clear()
      set({ user: null, isLoading: false, isInitialized: true })
    }
  },

  setUser: (user) => set({ user }),
}))
