import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
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

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
