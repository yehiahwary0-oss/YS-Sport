import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { usePushNotifications } from '../usePushNotifications'

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn() },
}))

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => `t:${key}`),
}))

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn(),
}))

const pushMock = vi.hoisted(() => ({
  getActiveSubscription: vi.fn(),
  isPushSupported: vi.fn(),
  subscribeToPush: vi.fn(),
  unsubscribeFromPush: vi.fn(),
}))

vi.mock('@/lib/push-notifications', () => pushMock)

const { useAuthStore } = await import('@/store/auth.store')
const toast = (await import('react-hot-toast')).default
const { isPushSupported, getActiveSubscription, subscribeToPush, unsubscribeFromPush } = pushMock

const subscription = { endpoint: 'https://push/x' }

function stubNotification(permission: NotificationPermission) {
  class FakeNotification {
    static permission = permission
    static async requestPermission(): Promise<NotificationPermission> {
      return FakeNotification.permission
    }
  }
  vi.stubGlobal('Notification', FakeNotification)
}

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockImplementation((selector: (s: { user: { uuid: string } | null }) => unknown) =>
      selector({ user: null })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports unsupported state when push is not available', () => {
    vi.mocked(isPushSupported).mockReturnValue(false)
    const { result } = renderHook(() => usePushNotifications())
    expect(result.current.supported).toBe(false)
    expect(result.current.permission).toBe('unsupported')
  })

  it('loads the active subscription on mount', async () => {
    vi.mocked(isPushSupported).mockReturnValue(true)
    stubNotification('granted')
    vi.mocked(getActiveSubscription).mockResolvedValue(subscription as never)

    const { result } = renderHook(() => usePushNotifications())

    await waitFor(() => expect(result.current.subscription).toEqual(subscription))
    expect(getActiveSubscription).toHaveBeenCalled()
    expect(result.current.isEnabled).toBe(true)
  })

  it('enable() requests permission and subscribes', async () => {
    vi.mocked(isPushSupported).mockReturnValue(true)
    stubNotification('granted')
    vi.mocked(getActiveSubscription).mockResolvedValue(null as never)
    vi.mocked(subscribeToPush).mockResolvedValue(subscription as never)

    const { result } = renderHook(() => usePushNotifications())
    await waitFor(() => expect(getActiveSubscription).toHaveBeenCalled())

    let granted = false
    await act(async () => {
      granted = await result.current.enable()
    })

    expect(granted).toBe(true)
    expect(subscribeToPush).toHaveBeenCalled()
    expect(result.current.subscription).toEqual(subscription)
    expect(result.current.loading).toBe(false)
  })

  it('enable() returns false when permission is denied', async () => {
    vi.mocked(isPushSupported).mockReturnValue(true)
    stubNotification('denied')
    vi.mocked(getActiveSubscription).mockResolvedValue(null as never)

    const { result } = renderHook(() => usePushNotifications())
    await waitFor(() => expect(getActiveSubscription).toHaveBeenCalled())

    let granted = true
    await act(async () => {
      granted = await result.current.enable()
    })

    expect(granted).toBe(false)
    expect(subscribeToPush).not.toHaveBeenCalled()
  })

  it('enable() toasts the error and returns false on failure', async () => {
    vi.mocked(isPushSupported).mockReturnValue(true)
    stubNotification('granted')
    vi.mocked(getActiveSubscription).mockResolvedValue(null as never)
    vi.mocked(subscribeToPush).mockRejectedValue(new Error('denied by browser'))

    const { result } = renderHook(() => usePushNotifications())
    await waitFor(() => expect(getActiveSubscription).toHaveBeenCalled())

    let granted = true
    await act(async () => {
      granted = await result.current.enable()
    })

    expect(granted).toBe(false)
    expect(toast.error).toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
  })

  it('disable() unsubscribes and clears the subscription', async () => {
    vi.mocked(isPushSupported).mockReturnValue(true)
    stubNotification('granted')
    vi.mocked(getActiveSubscription).mockResolvedValue(subscription as never)
    vi.mocked(unsubscribeFromPush).mockResolvedValue(undefined)

    const { result } = renderHook(() => usePushNotifications())
    await waitFor(() => expect(result.current.subscription).toEqual(subscription))

    await act(async () => {
      await result.current.disable()
    })

    expect(unsubscribeFromPush).toHaveBeenCalledWith(subscription)
    expect(result.current.subscription).toBeNull()
    expect(result.current.isEnabled).toBe(false)
  })

  it('disable() toasts the error on failure', async () => {
    vi.mocked(isPushSupported).mockReturnValue(true)
    stubNotification('granted')
    vi.mocked(getActiveSubscription).mockResolvedValue(subscription as never)
    vi.mocked(unsubscribeFromPush).mockRejectedValue(new Error('failed'))

    const { result } = renderHook(() => usePushNotifications())
    await waitFor(() => expect(result.current.subscription).toEqual(subscription))

    await act(async () => {
      await result.current.disable()
    })

    expect(toast.error).toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
  })

  it('auto-subscribes once for a logged-in user with granted permission', async () => {
    vi.mocked(isPushSupported).mockReturnValue(true)
    stubNotification('granted')
    vi.mocked(useAuthStore).mockImplementation((selector: (s: { user: { uuid: string } | null }) => unknown) =>
      selector({ user: { uuid: 'u1' } })
    )
    vi.mocked(getActiveSubscription).mockResolvedValue(null as never)
    vi.mocked(subscribeToPush).mockResolvedValue(subscription as never)

    const { result } = renderHook(() => usePushNotifications())

    await waitFor(() => expect(result.current.subscription).toEqual(subscription))
    expect(subscribeToPush).toHaveBeenCalled()
  })
})
