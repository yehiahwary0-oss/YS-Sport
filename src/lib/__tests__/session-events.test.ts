import { describe, expect, it } from 'vitest'
import {
  AUTH_EXPIRED_EVENT,
  AUTH_LOGOUT_EVENT,
  EXPIRED_QUERY_PARAM,
} from '@/lib/session-events'

describe('session-events', () => {
  it('exports the logout event name', () => {
    expect(AUTH_LOGOUT_EVENT).toBe('auth:logout')
  })

  it('exports the expired event name', () => {
    expect(AUTH_EXPIRED_EVENT).toBe('auth:expired')
  })

  it('exports the expired query param', () => {
    expect(EXPIRED_QUERY_PARAM).toBe('expired')
  })

  it('uses distinct event names', () => {
    expect(AUTH_LOGOUT_EVENT).not.toBe(AUTH_EXPIRED_EVENT)
  })
})
