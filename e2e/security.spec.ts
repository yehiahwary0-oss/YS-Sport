import { test, expect } from '@playwright/test'

test.describe('security headers', () => {
  test('serves a strict Content-Security-Policy with a per-request nonce', async ({
    request,
  }) => {
    const res = await request.get('/en')
    expect(res.status()).toBe(200)

    const csp = res.headers()['content-security-policy']
    expect(csp).toBeTruthy()

    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self' 'nonce-")
    expect(csp).toMatch(/'nonce-[A-Za-z0-9+/=_-]{16,}'/)
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test('nonce changes between requests', async ({ request }) => {
    const nonceOf = async () => {
      const res = await request.get('/en')
      const csp = res.headers()['content-security-policy']
      return csp.match(/'nonce-[^']+'/)![0]
    }

    expect(await nonceOf()).not.toBe(await nonceOf())
  })

  test('redirects unauthenticated visitors away from protected routes', async ({
    request,
  }) => {
    const res = await request.get('/en/athlete/dashboard', { maxRedirects: 0 })
    expect(res.status()).toBe(307)
    expect(res.headers()['location']).toContain('/en/auth/login')
  })
})
