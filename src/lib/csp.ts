/**
 * Content-Security-Policy builder — pure, unit-tested, no Next.js imports.
 *
 * The nonce is generated per-request in the middleware (Edge runtime) and
 * embedded here. Next.js 15 automatically applies the response-header nonce
 * to its own inline bootstrap scripts/styles, so we do NOT need
 * 'unsafe-inline' for scripts — only for styles (framer-motion + Next
 * inject inline style attributes that cannot be nonce'd reliably).
 *
 * Service worker note: `worker-src 'self'` allows public/sw.js registration
 * and execution; the registration script itself is part of the self-hosted
 * bundle and is covered by `script-src 'self' 'nonce-...'`.
 */

export function originOf(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

function pusherHosts(cluster: string | undefined): string[] {
  if (!cluster) return []
  return [`https://*.pusher.com`, `wss://*.pusher.com`]
}

export function sentryHost(dsn: string | undefined): string | null {
  if (!dsn) return null
  const origin = originOf(dsn)
  if (!origin) return null
  const host = new URL(origin).hostname
  // DSN host is usually <org>.ingest.sentry.io — allow the whole ingest domain
  return /\.ingest\.sentry\.io$/.test(host)
    ? 'https://*.ingest.sentry.io'
    : origin
}

export interface CspInput {
  nonce: string
  /** NEXT_PUBLIC_API_URL, e.g. http://localhost:8000/api/v1 */
  apiUrl?: string
  /** NEXT_PUBLIC_CDN_URL, e.g. https://cdn.yssports.com */
  cdnUrl?: string
  /** NEXT_PUBLIC_PUSHER_CLUSTER, e.g. mt1 */
  pusherCluster?: string
  /** NEXT_PUBLIC_SENTRY_DSN or SENTRY_DSN */
  sentryDsn?: string
  /** Plausible analytics API host, e.g. https://plausible.io (only when enabled) */
  analyticsHost?: string
  /** When true, allow localhost http/ws origins (dev tooling + HMR) */
  allowLocalDev?: boolean
}

export function buildCsp(input: CspInput): string {
  const apiOrigin = originOf(input.apiUrl)
  const cdnOrigin = originOf(input.cdnUrl)
  const sentry = sentryHost(input.sentryDsn)
  const analytics = originOf(input.analyticsHost)

  const connectSources = ["'self'"]
  if (apiOrigin) connectSources.push(apiOrigin)
  connectSources.push(...pusherHosts(input.pusherCluster))
  if (sentry) connectSources.push(sentry)
  if (analytics) connectSources.push(analytics)
  if (input.allowLocalDev) {
    connectSources.push(
      'http://localhost:*',
      'https://localhost:*',
      'ws://localhost:*',
      'wss://localhost:*',
      'http://127.0.0.1:*',
      'ws://127.0.0.1:*'
    )
  }

  const imgSources = ["'self'", 'data:', 'blob:']
  if (cdnOrigin) imgSources.push(cdnOrigin)

  const directives: string[] = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${input.nonce}'${analytics ? ` ${analytics}` : ''}`,
    // Next.js + framer-motion inject inline style attributes — safe because
    // no user-controlled CSS is ever interpolated into them.
    `style-src 'self' 'unsafe-inline'`,
    `img-src ${imgSources.join(' ')}`,
    `font-src 'self' data:`,
    `connect-src ${connectSources.join(' ')}`,
    `worker-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ]

  return directives.join('; ')
}
