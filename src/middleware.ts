import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { buildCsp } from './lib/csp'
import {
  REFRESH_COOKIE_NAME,
  resolveAuthGuard,
  splitLocalePath,
} from './lib/auth-guard'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { locale, path } = splitLocalePath(request.nextUrl.pathname)

  const decision = resolveAuthGuard(path, request.cookies.has(REFRESH_COOKIE_NAME), locale)

  if (decision.type === 'redirect') {
    return NextResponse.redirect(new URL(decision.to, request.url))
  }

  const response = intlMiddleware(request)

  // Per-request nonce: Next.js 15 automatically applies it to its own
  // inline bootstrap scripts/styles (see src/lib/csp.ts for the full
  // rationale and the allowlist).
  const nonce = crypto.randomUUID()
  response.headers.set(
    'Content-Security-Policy',
    buildCsp({
      nonce,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      cdnUrl: process.env.NEXT_PUBLIC_CDN_URL,
      pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
      analyticsHost: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
        ? process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io'
        : undefined,
      allowLocalDev: process.env.NEXT_PUBLIC_APP_ENV !== 'production',
    })
  )

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
