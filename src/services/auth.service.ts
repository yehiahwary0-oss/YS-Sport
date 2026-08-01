import { api, tokenStore } from '@/lib/api'
import type { AuthTokens, AuthUser, LoginPayload, RegisterPayload } from '@/types'

export const authService = {

  async register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register', payload)
    return data.data as { uuid: string; email: string; role: string }
  },

  async login(payload: LoginPayload): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const { data } = await api.post('/auth/login', payload)
    const tokens = data.data as AuthTokens
    tokenStore.set(tokens.access_token)
    const user = await authService.me()
    return { user, tokens }
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get('/auth/me')
    return data.data as AuthUser
  },

  async logout() {
    try { await api.post('/auth/logout') } catch {}
    tokenStore.clear()
  },

  async forgotPassword(email: string) {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data.message as string
  },

  async resetPassword(payload: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }) {
    const { data } = await api.post('/auth/reset-password', payload)
    return data.message as string
  },

  async verifyEmail(token: string, email: string) {
    const { data } = await api.post('/auth/verify-email', { token, email })
    return data.message as string
  },

  async resendVerification(email: string) {
    const { data } = await api.post('/auth/resend-verification', { email })
    return data.message as string
  },

  async changePassword(payload: {
    current_password: string
    new_password: string
    new_password_confirmation: string
  }) {
    const { data } = await api.post('/auth/change-password', payload)
    return data.message as string
  },
}
