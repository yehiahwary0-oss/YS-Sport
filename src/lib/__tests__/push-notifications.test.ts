import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  SW_URL,
  isPushSupported,
  urlBase64ToUint8Array,
  getVapidPublicKey,
  registerServiceWorker,
  getActiveSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  isStandalonePwa,
} from '../push-notifications'

vi.mock('../api', () => ({
  api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

const { api } = await import('../api')

function stubPushApis(overrides: { hasServiceWorker?: boolean; hasPushManager?: boolean } = {}) {
  const { hasServiceWorker = false, hasPushManager = false } = overrides
  const windowObj = globalThis as unknown as Record<string, unknown>
  windowObj.navigator = hasServiceWorker ? { serviceWorker: {} } : {}
  if (hasPushManager) {
    Object.defineProperty(windowObj, 'PushManager', { value: class PushManager {}, configurable: true })
  } else {
    delete (windowObj as { PushManager?: unknown }).PushManager
  }
}

describe('isPushSupported', () => {
  it('returns false when ServiceWorker is missing', () => {
    stubPushApis({ hasPushManager: true })
    expect(isPushSupported()).toBe(false)
  })

  it('returns false when PushManager is missing', () => {
    stubPushApis({ hasServiceWorker: true })
    expect(isPushSupported()).toBe(false)
  })

  it('returns true when both APIs exist', () => {
    stubPushApis({ hasServiceWorker: true, hasPushManager: true })
    expect(isPushSupported()).toBe(true)
  })
})

describe('urlBase64ToUint8Array', () => {
  it('decodes base64url into bytes', () => {
    const bytes = urlBase64ToUint8Array('AQID')
    expect(Array.from(bytes)).toEqual([1, 2, 3])
  })

  it('handles missing padding', () => {
    const bytes = urlBase64ToUint8Array('AQI')
    expect(Array.from(bytes)).toEqual([1, 2])
  })

  it('handles url-safe characters', () => {
    const bytes = urlBase64ToUint8Array('_-8')
    expect(Array.from(bytes)).toEqual([255, 239])
  })
})

describe('getVapidPublicKey', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the env key when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY', 'env-key')
    await expect(getVapidPublicKey()).resolves.toBe('env-key')
    expect(api.get).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })

  it('fetches the key from the server when the env is unset', async () => {
    vi.unstubAllEnvs()
    vi.mocked(api.get).mockResolvedValue({ data: { data: { public_key: 'server-key' } } })
    await expect(getVapidPublicKey()).resolves.toBe('server-key')
    expect(api.get).toHaveBeenCalledWith('/config/vapid-key')
  })

  it('throws when the server returns no key', async () => {
    vi.unstubAllEnvs()
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    await expect(getVapidPublicKey()).rejects.toThrow('VAPID public key not configured')
  })
})

describe('registerServiceWorker', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when unsupported', async () => {
    stubPushApis({ hasPushManager: true })
    await expect(registerServiceWorker()).resolves.toBeNull()
  })

  it('returns null when the serviceWorker API is missing', async () => {
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.navigator = {}
    Object.defineProperty(windowObj, 'PushManager', { value: class PushManager {}, configurable: true })
    await expect(registerServiceWorker()).resolves.toBeNull()
  })

  it('registers sw.js with the root scope', async () => {
    const register = vi.fn().mockResolvedValue({ scope: '/' })
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.navigator = { serviceWorker: { register } }
    Object.defineProperty(windowObj, 'PushManager', { value: class PushManager {}, configurable: true })

    await expect(registerServiceWorker()).resolves.toEqual({ scope: '/' })
    expect(register).toHaveBeenCalledWith(SW_URL, { scope: '/' })
  })
})

describe('getActiveSubscription', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when no registration exists', async () => {
    stubPushApis({ hasServiceWorker: true, hasPushManager: true })
    ;(globalThis as unknown as { navigator: { serviceWorker: { getRegistration: unknown } } }).navigator.serviceWorker.getRegistration = vi.fn().mockResolvedValue(null)
    await expect(getActiveSubscription()).resolves.toBeNull()
  })

  it('returns the existing subscription', async () => {
    const subscription = { endpoint: 'https://push/x' }
    stubPushApis({ hasServiceWorker: true, hasPushManager: true })
    ;(globalThis as unknown as { navigator: { serviceWorker: { getRegistration: unknown } } }).navigator.serviceWorker.getRegistration = vi.fn().mockResolvedValue({
      pushManager: { getSubscription: vi.fn().mockResolvedValue(subscription) },
    })
    await expect(getActiveSubscription()).resolves.toBe(subscription)
  })

  it('returns null when there is no subscription', async () => {
    stubPushApis({ hasServiceWorker: true, hasPushManager: true })
    ;(globalThis as unknown as { navigator: { serviceWorker: { getRegistration: unknown } } }).navigator.serviceWorker.getRegistration = vi.fn().mockResolvedValue({
      pushManager: { getSubscription: vi.fn().mockResolvedValue(null) },
    })
    await expect(getActiveSubscription()).resolves.toBeNull()
  })
})

describe('subscribeToPush / unsubscribeFromPush', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when unsupported', async () => {
    stubPushApis({ hasPushManager: true })
    await expect(subscribeToPush()).resolves.toBeNull()
  })

  it('returns null when registration fails', async () => {
    stubPushApis({ hasPushManager: true })
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.navigator = { serviceWorker: { register: vi.fn().mockResolvedValue(null) } }
    Object.defineProperty(windowObj, 'PushManager', { value: class PushManager {}, configurable: true })
    await expect(subscribeToPush()).resolves.toBeNull()
  })

  it('reuses an existing subscription', async () => {
    stubPushApis({ hasPushManager: true })
    const subscription = {
      endpoint: 'https://push/x',
      getKey: vi.fn(() => new Uint8Array([1, 2, 3])),
    }
    const register = vi.fn().mockResolvedValue({
      pushManager: { getSubscription: vi.fn().mockResolvedValue(subscription) },
    })
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.navigator = { serviceWorker: { register } }
    Object.defineProperty(windowObj, 'PushManager', { value: class PushManager {}, configurable: true })
    vi.mocked(api.post).mockResolvedValue({} as never)

    await expect(subscribeToPush()).resolves.toBe(subscription)
    expect(api.post).toHaveBeenCalledWith('/notifications/push-subscription', {
      endpoint: 'https://push/x',
      p256dh: expect.any(String),
      auth: expect.any(String),
      device_type: 'web',
    })
  })

  it('subscribes when there is no active subscription', async () => {
    stubPushApis({ hasPushManager: true })
    vi.mocked(api.get).mockResolvedValue({ data: { data: { public_key: 'AQID' } } })
    const subscription = {
      endpoint: 'https://push/new',
      getKey: vi.fn(() => new Uint8Array([1, 2, 3])),
    }
    const pushManager = {
      getSubscription: vi.fn().mockResolvedValue(null),
      subscribe: vi.fn().mockResolvedValue(subscription),
    }
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.navigator = { serviceWorker: { register: vi.fn().mockResolvedValue({ pushManager }) } }
    Object.defineProperty(windowObj, 'PushManager', { value: class PushManager {}, configurable: true })
    vi.mocked(api.post).mockResolvedValue({} as never)

    await expect(subscribeToPush()).resolves.toBe(subscription)
    expect(pushManager.subscribe).toHaveBeenCalledWith({
      userVisibleOnly: true,
      applicationServerKey: expect.any(Uint8Array),
    })
  })

  it('is a no-op when unsupported', async () => {
    stubPushApis({ hasServiceWorker: true })
    await expect(unsubscribeFromPush()).resolves.toBeUndefined()
  })

  it('unsubscribes and notifies the server best-effort', async () => {
    stubPushApis({ hasPushManager: true })
    const subscription = {
      endpoint: 'https://push/x',
      unsubscribe: vi.fn().mockResolvedValue(true),
    }
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.navigator = {
      serviceWorker: {
        getRegistration: vi.fn().mockResolvedValue({
          pushManager: { getSubscription: vi.fn().mockResolvedValue(subscription) },
        }),
      },
    }
    Object.defineProperty(windowObj, 'PushManager', { value: class PushManager {}, configurable: true })
    vi.mocked(api.delete).mockResolvedValue({} as never)

    await unsubscribeFromPush(subscription as never)

    expect(api.delete).toHaveBeenCalledWith('/notifications/push-subscription', {
      data: { endpoint: 'https://push/x' },
    })
    expect(subscription.unsubscribe).toHaveBeenCalled()
  })

  it('still unsubscribes locally when the server call fails', async () => {
    stubPushApis({ hasServiceWorker: true, hasPushManager: true })
    const subscription = {
      endpoint: 'https://push/x',
      unsubscribe: vi.fn().mockResolvedValue(true),
    }
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.navigator = {
      serviceWorker: {
        getRegistration: vi.fn().mockResolvedValue({
          pushManager: { getSubscription: vi.fn().mockResolvedValue(subscription) },
        }),
      },
    }
    vi.mocked(api.delete).mockRejectedValue(new Error('404'))
    await unsubscribeFromPush(subscription as never)
    expect(subscription.unsubscribe).toHaveBeenCalled()
  })

  it('does nothing when there is no subscription', async () => {
    stubPushApis({ hasPushManager: true })
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.navigator = {
      serviceWorker: {
        getRegistration: vi.fn().mockResolvedValue({
          pushManager: { getSubscription: vi.fn().mockResolvedValue(null) },
        }),
      },
    }
    Object.defineProperty(windowObj, 'PushManager', { value: class PushManager {}, configurable: true })
    await unsubscribeFromPush()
    expect(api.delete).not.toHaveBeenCalled()
  })
})

describe('isStandalonePwa', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true in standalone display mode', () => {
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.matchMedia = vi.fn().mockReturnValue({ matches: true })
    expect(isStandalonePwa()).toBe(true)
  })

  it('returns false in normal display mode', () => {
    const windowObj = globalThis as unknown as Record<string, unknown>
    windowObj.matchMedia = vi.fn().mockReturnValue({ matches: false })
    expect(isStandalonePwa()).toBe(false)
  })
})
