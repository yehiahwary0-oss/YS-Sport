import { describe, it, expect, vi, beforeEach } from 'vitest'
import Pusher from 'pusher-js'
import { getPusherClient, disconnectPusher } from '../pusher'

const tokenStoreMock = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('pusher-js', () => {
  return {
    default: vi.fn(function () {
      return { disconnect: vi.fn() }
    }),
  }
})

vi.mock('../api', () => ({
  tokenStore: tokenStoreMock,
}))

describe('getPusherClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    disconnectPusher()
  })

  it('creates a singleton with the default cluster and no key', () => {
    const client = getPusherClient()

    expect(client).toBe(getPusherClient())
    expect(Pusher).toHaveBeenCalledTimes(1)
    const [key, options] = vi.mocked(Pusher).mock.calls[0] as unknown as [string, Record<string, unknown>]
    expect(key).toBe('')
    expect(options.cluster).toBe('mt1')
    expect(options.authEndpoint).toBe('http://localhost:8000/broadcasting/auth')
  })

  it('derives the auth endpoint from the API URL', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com/api/v1')
    const client = getPusherClient()
    const [, options] = vi.mocked(Pusher).mock.calls[0] as unknown as [string, { authEndpoint: string }]
    expect(options.authEndpoint).toBe('https://api.example.com/broadcasting/auth')
    void client
    vi.unstubAllEnvs()
  })

  it('attaches the Bearer token dynamically in the auth header', () => {
    tokenStoreMock.get.mockReturnValue('tok-9')
    getPusherClient()
    const [, options] = vi.mocked(Pusher).mock.calls[0] as unknown as [
      string,
      { auth: { headers: { Authorization: string } } }
    ]
    expect(options.auth.headers.Authorization).toBe('Bearer tok-9')
  })

  it('returns an empty Authorization when no token is set', () => {
    tokenStoreMock.get.mockReturnValue(null)
    getPusherClient()
    const [, options] = vi.mocked(Pusher).mock.calls[0] as unknown as [
      string,
      { auth: { headers: { Authorization: string } } }
    ]
    expect(options.auth.headers.Authorization).toBe('')
  })
})

describe('disconnectPusher', () => {
  it('disconnects and resets the singleton', () => {
    const client = getPusherClient() as unknown as { disconnect: () => unknown }
    disconnectPusher()
    expect(client.disconnect).toHaveBeenCalled()

    getPusherClient()
    expect(Pusher).toHaveBeenCalledTimes(2)
  })

  it('is a no-op when no client exists', () => {
    expect(() => disconnectPusher()).not.toThrow()
  })
})
