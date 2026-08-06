import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '../auth.store'
import { authService } from '@/services/auth.service'
import { tokenStore } from '@/lib/api'

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}))

vi.mock('@/lib/api', () => ({
  tokenStore: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
  },
}))

vi.mock('@/lib/analytics', () => ({
  ANALYTICS_EVENTS: { login: 'login' },
  trackEvent: vi.fn(),
}))

const { trackEvent } = await import('@/lib/analytics')
const user = { uuid: 'u1', email: 'a@b.c', role: 'coach' }

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, isLoading: false, isInitialized: false })
  })

  it('login sets the user and fires the login event', async () => {
    vi.mocked(authService.login).mockResolvedValue({ user, tokens: { access_token: 't' } })

    const result = await useAuthStore.getState().login('a@b.c', 'secret')

    expect(result).toEqual(user)
    expect(trackEvent).toHaveBeenCalledWith('login')
    expect(useAuthStore.getState()).toMatchObject({ user, isLoading: false, isInitialized: true })
  })

  it('login clears loading and rethrows on failure', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('bad credentials'))

    await expect(useAuthStore.getState().login('a@b.c', 'bad')).rejects.toThrow('bad credentials')
    expect(useAuthStore.getState().isLoading).toBe(false)
    expect(useAuthStore.getState().user).toBeNull()
    expect(trackEvent).not.toHaveBeenCalled()
  })

  it('logout clears the user', async () => {
    useAuthStore.setState({ user })
    vi.mocked(authService.logout).mockResolvedValue(undefined)

    await useAuthStore.getState().logout()

    expect(authService.logout).toHaveBeenCalled()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('fetchUser hydrates the user', async () => {
    vi.mocked(authService.me).mockResolvedValue(user)

    await useAuthStore.getState().fetchUser()

    expect(useAuthStore.getState()).toMatchObject({ user, isLoading: false, isInitialized: true })
  })

  it('fetchUser clears the token and user on failure', async () => {
    vi.mocked(authService.me).mockRejectedValue(new Error('401'))

    await useAuthStore.getState().fetchUser()

    expect(tokenStore.clear).toHaveBeenCalled()
    expect(useAuthStore.getState()).toMatchObject({ user: null, isLoading: false, isInitialized: true })
  })

  it('setUser updates the user directly', () => {
    useAuthStore.getState().setUser(user)
    expect(useAuthStore.getState().user).toEqual(user)

    useAuthStore.getState().setUser(null)
    expect(useAuthStore.getState().user).toBeNull()
  })
})
