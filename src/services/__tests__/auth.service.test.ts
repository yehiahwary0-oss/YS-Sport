import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '../auth.service'
import { tokenStore } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  tokenStore: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
}))

const { api } = await import('@/lib/api')

const authUser = { uuid: 'u1', email: 'a@b.c', role: 'coach' }

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('register POSTs the payload and returns the created user', async () => {
    const payload = { email: 'a@b.c', password: 'secret', display_name: 'Ali' }
    vi.mocked(api.post).mockResolvedValue({ data: { data: authUser } })

    await expect(authService.register(payload)).resolves.toEqual(authUser)
    expect(api.post).toHaveBeenCalledWith('/auth/register', payload)
  })

  it('login POSTs credentials, stores the token and fetches the user', async () => {
    const tokens = { access_token: 'tok-1', refresh_token: 'ref-1', token_type: 'Bearer', expires_in: 3600 }
    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: tokens } })
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: authUser } })

    const result = await authService.login({ email: 'a@b.c', password: 'secret' })

    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'secret' })
    expect(tokenStore.set).toHaveBeenCalledWith('tok-1')
    expect(api.get).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual({ user: authUser, tokens })
  })

  it('me GETs and unwraps the user', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: authUser } })
    await expect(authService.me()).resolves.toEqual(authUser)
    expect(api.get).toHaveBeenCalledWith('/auth/me')
  })

  it('logout clears the token even if the API call fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('offline'))
    await expect(authService.logout()).resolves.toBeUndefined()
    expect(tokenStore.clear).toHaveBeenCalled()
  })

  it('logout POSTs /auth/logout on success', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await authService.logout()
    expect(api.post).toHaveBeenCalledWith('/auth/logout')
    expect(tokenStore.clear).toHaveBeenCalled()
  })

  it('forgotPassword POSTs the email and returns the server message', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Check your inbox.' } })
    await expect(authService.forgotPassword('a@b.c')).resolves.toBe('Check your inbox.')
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'a@b.c' })
  })

  it('resetPassword POSTs the payload', async () => {
    const payload = { token: 't', email: 'a@b.c', password: 'new', password_confirmation: 'new' }
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Password reset.' } })
    await expect(authService.resetPassword(payload)).resolves.toBe('Password reset.')
    expect(api.post).toHaveBeenCalledWith('/auth/reset-password', payload)
  })

  it('verifyEmail POSTs token and email', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Verified.' } })
    await expect(authService.verifyEmail('tok', 'a@b.c')).resolves.toBe('Verified.')
    expect(api.post).toHaveBeenCalledWith('/auth/verify-email', { token: 'tok', email: 'a@b.c' })
  })

  it('resendVerification POSTs the email', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Sent.' } })
    await expect(authService.resendVerification('a@b.c')).resolves.toBe('Sent.')
    expect(api.post).toHaveBeenCalledWith('/auth/resend-verification', { email: 'a@b.c' })
  })

  it('changePassword POSTs the payload', async () => {
    const payload = { current_password: 'old', new_password: 'new', new_password_confirmation: 'new' }
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Changed.' } })
    await expect(authService.changePassword(payload)).resolves.toBe('Changed.')
    expect(api.post).toHaveBeenCalledWith('/auth/change-password', payload)
  })

  it('propagates API errors', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network'))
    await expect(authService.register({ email: 'a@b.c', password: 'x' })).rejects.toThrow('network')
  })
})
