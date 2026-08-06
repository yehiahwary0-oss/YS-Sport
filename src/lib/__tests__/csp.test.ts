import { describe, expect, it } from 'vitest'
import { buildCsp, originOf, sentryHost } from '@/lib/csp'

describe('originOf', () => {
  it('extracts origin from a full URL with path', () => {
    expect(originOf('http://localhost:8000/api/v1')).toBe('http://localhost:8000')
    expect(originOf('https://app.yssports.com/en/marketplace')).toBe('https://app.yssports.com')
  })

  it('returns null for empty or invalid input', () => {
    expect(originOf(undefined)).toBeNull()
    expect(originOf('')).toBeNull()
    expect(originOf('not a url')).toBeNull()
  })
})

describe('sentryHost', () => {
  it('expands ingest DSN hosts to the ingest wildcard', () => {
    expect(sentryHost('https://abc123@o450000.ingest.sentry.io/450000')).toBe(
      'https://*.ingest.sentry.io'
    )
  })

  it('keeps non-ingest origins as-is', () => {
    expect(sentryHost('https://sentry.example.com')).toBe('https://sentry.example.com')
  })

  it('returns null without a DSN', () => {
    expect(sentryHost(undefined)).toBeNull()
  })
})

describe('buildCsp', () => {
  it('always includes the nonce in script-src', () => {
    const csp = buildCsp({ nonce: 'abc123' })
    expect(csp).toContain(`script-src 'self' 'nonce-abc123'`)
  })

  it('includes the required security directives', () => {
    const csp = buildCsp({ nonce: 'n1' })
    expect(csp).toContain(`default-src 'self'`)
    expect(csp).toContain(`object-src 'none'`)
    expect(csp).toContain(`base-uri 'self'`)
    expect(csp).toContain(`form-action 'self'`)
    expect(csp).toContain(`frame-ancestors 'none'`)
    expect(csp).toContain(`worker-src 'self'`)
    expect(csp).toContain(`font-src 'self' data:`)
  })

  it('allowlists the API origin in connect-src', () => {
    const csp = buildCsp({ nonce: 'n1', apiUrl: 'https://api.yssports.com/api/v1' })
    expect(csp).toContain(`connect-src 'self' https://api.yssports.com`)
  })

  it('allowlists the CDN origin in img-src', () => {
    const csp = buildCsp({ nonce: 'n1', cdnUrl: 'https://cdn.yssports.com' })
    expect(csp).toContain(`img-src 'self' data: blob: https://cdn.yssports.com`)
  })

  it('allowlists pusher websocket hosts when a cluster is set', () => {
    const csp = buildCsp({ nonce: 'n1', pusherCluster: 'mt1' })
    expect(csp).toContain(`wss://*.pusher.com`)
    expect(csp).toContain(`https://*.pusher.com`)
  })

  it('allowlists sentry ingest when a DSN is set', () => {
    const csp = buildCsp({ nonce: 'n1', sentryDsn: 'https://x@o1.ingest.sentry.io/1' })
    expect(csp).toContain(`https://*.ingest.sentry.io`)
  })

  it('allowlists the analytics host in script-src and connect-src', () => {
    const csp = buildCsp({ nonce: 'n1', analyticsHost: 'https://plausible.io' })
    expect(csp).toContain(`script-src 'self' 'nonce-n1' https://plausible.io`)
    expect(csp).toContain(`connect-src 'self' https://plausible.io`)
  })

  it('omits optional hosts when their inputs are missing', () => {
    const csp = buildCsp({ nonce: 'n1' })
    expect(csp).not.toContain('pusher.com')
    expect(csp).not.toContain('sentry.io')
    expect(csp).not.toContain('cdn.yssports.com')
    expect(csp).not.toContain('plausible.io')
  })

  it('does not add localhost allowances outside dev', () => {
    const csp = buildCsp({ nonce: 'n1' })
    expect(csp).not.toContain('localhost')
  })

  it('adds localhost allowances in dev', () => {
    const csp = buildCsp({ nonce: 'n1', allowLocalDev: true })
    expect(csp).toContain('ws://localhost:*')
    expect(csp).toContain('http://localhost:*')
    expect(csp).toContain('http://127.0.0.1:*')
  })
})
