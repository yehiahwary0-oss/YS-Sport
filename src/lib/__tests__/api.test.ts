import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { api, tokenStore, getApiError, getValidationErrors } from '../api'
import { AUTH_EXPIRED_EVENT } from '../session-events'

function makeAxiosError(status: number, data: unknown, url: string): AxiosError {
  return new AxiosError(
    `Request failed with status code ${status}`,
    undefined,
    {
      url,
      headers: new AxiosHeaders(),
    },
    undefined,
    {
      status,
      statusText: '',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data,
    }
  )
}

describe('tokenStore', () => {
  afterEach(() => tokenStore.clear())

  it('stores, reads and clears the access token', () => {
    expect(tokenStore.get()).toBeNull()
    tokenStore.set('abc')
    expect(tokenStore.get()).toBe('abc')
    tokenStore.clear()
    expect(tokenStore.get()).toBeNull()
  })
})

describe('request interceptor', () => {
  it('attaches the Bearer token when present', () => {
    tokenStore.set('tok-1')
    const config = { headers: new AxiosHeaders() }
    const result = api.interceptors.request.handlers[0].fulfilled(config) as typeof config
    expect(result.headers.get('Authorization')).toBe('Bearer tok-1')
  })

  it('leaves the config untouched when there is no token', () => {
    tokenStore.clear()
    const config = { headers: new AxiosHeaders() }
    const result = api.interceptors.request.handlers[0].fulfilled(config) as typeof config
    expect(result.headers.get('Authorization')).toBeUndefined()
  })
})

describe('response interceptor — 401 refresh flow', () => {
  const adapterKey = 'adapter' as keyof typeof api.defaults

  function stubAdapter() {
    const urls: string[] = []
    const adapter = async (config: InternalAxiosRequestConfig) => {
      urls.push(String(config.url))
      if (String(config.url).includes('/auth/refresh')) {
        return { data: { data: { access_token: 'new-tok' } }, status: 200, statusText: 'OK', headers: {}, config }
      }
      return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config }
    }
    Object.defineProperty(api.defaults, adapterKey, { value: adapter, configurable: true, writable: true, enumerable: true })
    return urls
  }

  beforeEach(() => {
    vi.restoreAllMocks()
    tokenStore.clear()
    delete api.defaults[adapterKey]
  })

  afterEach(() => {
    delete api.defaults[adapterKey]
  })

  it('rejects non-401 errors unchanged', async () => {
    const error = makeAxiosError(500, {}, '/coach/profile')
    await expect(api.interceptors.response.handlers[0].rejected(error)).rejects.toBe(error)
  })

  it('rejects 401 on the refresh endpoint unchanged', async () => {
    const error = makeAxiosError(401, {}, '/auth/refresh')
    await expect(api.interceptors.response.handlers[0].rejected(error)).rejects.toBe(error)
  })

  it('rejects 401 on the login endpoint unchanged', async () => {
    const error = makeAxiosError(401, {}, '/auth/login')
    await expect(api.interceptors.response.handlers[0].rejected(error)).rejects.toBe(error)
  })

  it('rejects 401 on a retried request without refreshing again', async () => {
    const error = makeAxiosError(401, {}, '/coach/profile')
    error.config = { url: '/coach/profile', headers: new AxiosHeaders(), _retry: true } as never
    await expect(api.interceptors.response.handlers[0].rejected(error)).rejects.toBe(error)
  })

  it('refreshes, stores the new token, retries the original and drains the queue', async () => {
    const urls = stubAdapter()

    const original = makeAxiosError(401, {}, '/coach/profile')
    const result = await api.interceptors.response.handlers[0].rejected(original)

    expect(urls).toContain('/auth/refresh')
    expect(urls).toContain('/coach/profile')
    expect(tokenStore.get()).toBe('new-tok')
    expect(result).toMatchObject({ status: 200, data: { ok: true } })
  })

  it('queues concurrent 401s behind a single refresh', async () => {
    const urls = stubAdapter()
    const e1 = makeAxiosError(401, {}, '/a')
    const e2 = makeAxiosError(401, {}, '/b')
    const p1 = api.interceptors.response.handlers[0].rejected(e1)
    const p2 = api.interceptors.response.handlers[0].rejected(e2)

    const [r1, r2] = await Promise.all([p1, p2])

    expect(urls.filter((u) => u.includes('/auth/refresh')).length).toBe(1)
    expect(r1).toMatchObject({ status: 200 })
    expect(r2).toMatchObject({ status: 200 })
  })

  it('clears the token and dispatches AUTH_EXPIRED_EVENT when refresh fails', async () => {
    tokenStore.set('stale')
    vi.spyOn(api, 'post').mockRejectedValueOnce(makeAxiosError(401, {}, '/auth/refresh'))
    const dispatchSpy = vi.fn()
    vi.stubGlobal('window', {
      location: { pathname: '/en/coach/dashboard' },
      dispatchEvent: dispatchSpy,
    })

    const original = makeAxiosError(401, {}, '/coach/profile')
    await expect(api.interceptors.response.handlers[0].rejected(original)).rejects.toBeTruthy()

    expect(tokenStore.get()).toBeNull()
    expect(dispatchSpy).toHaveBeenCalled()
    const evt = dispatchSpy.mock.calls[0][0] as Event
    expect(evt.type).toBe(AUTH_EXPIRED_EVENT)
    vi.unstubAllGlobals()
  })

  it('does not dispatch the expiry event while already on the login page', async () => {
    vi.spyOn(api, 'post').mockRejectedValueOnce(makeAxiosError(401, {}, '/auth/refresh'))
    const dispatchSpy = vi.fn()
    vi.stubGlobal('window', {
      location: { pathname: '/en/auth/login' },
      dispatchEvent: dispatchSpy,
    })

    const original = makeAxiosError(401, {}, '/coach/profile')
    await expect(api.interceptors.response.handlers[0].rejected(original)).rejects.toBeTruthy()

    expect(dispatchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})

describe('getApiError', () => {
  it('returns the server message for axios errors', () => {
    const err = makeAxiosError(422, { error: { message: 'Invalid data' } }, '/x')
    expect(getApiError(err)).toBe('Invalid data')
  })

  it('falls back to the generic axios message', () => {
    const err = makeAxiosError(500, { error: {} }, '/x')
    expect(getApiError(err)).toBe('Request failed with status code 500')
  })

  it('returns the generic message for non-axios errors', () => {
    expect(getApiError(new Error('random'))).toBe('Something went wrong. Please try again.')
    expect(getApiError(null)).toBe('Something went wrong. Please try again.')
    expect(getApiError('string error')).toBe('Something went wrong. Please try again.')
  })
})

describe('getValidationErrors', () => {
  it('maps validation error arrays to the first message per field', () => {
    const err = makeAxiosError(
      422,
      { error: { errors: { email: ['Email is required.', 'Email too long'], password: ['Too short.'] } } },
      '/x'
    )
    expect(getValidationErrors(err)).toEqual({ email: 'Email is required.', password: 'Too short.' })
  })

  it('returns an empty map when there are no validation errors', () => {
    expect(getValidationErrors(makeAxiosError(422, { error: {} }, '/x'))).toEqual({})
    expect(getValidationErrors(makeAxiosError(500, { error: { message: 'x' } }, '/x'))).toEqual({})
    expect(getValidationErrors(new Error('plain'))).toEqual({})
  })
})
