import { routing } from '@/i18n/routing'

/**
 * Server-side route protection for the Next.js middleware.
 *
 * The frontend keeps the JWT access token in memory ONLY (never
 * localStorage/cookies — see src/lib/api.ts tokenStore), and the refresh
 * token lives in an HttpOnly cookie set by the Laravel API. The middleware
 * therefore CANNOT decode a JWT locally. Instead it uses cookie PRESENCE
 * as a fast, network-free heuristic:
 *
 *   - No `refresh_token` cookie  → not authenticated → bounce to /auth/login
 *   - Cookie present             → likely authenticated → let the page render
 *
 * Role checks and suspension remain client-side in RoleGuard (they already
 * are, via /auth/me data). This eliminates the "unauthenticated user sees
 * /admin" flash entirely, with zero added latency.
 */

export const REFRESH_COOKIE_NAME = 'refresh_token'

/** Protected path prefixes (no locale) → required role. */
export const PROTECTED_PATHS: Record<string, 'admin' | 'coach' | 'athlete'> = {
  '/admin': 'admin',
  '/coach': 'coach',
  '/athlete': 'athlete',
}

/** Auth pages — an authenticated visitor is bounced to their dashboard. */
export const AUTH_PAGES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
]

/**
 * Reachable with OR without a session. Excluded from the authenticated
 * redirect: a suspended user with a valid cookie must be able to land here
 * (RoleGuard sends them), otherwise we'd create a redirect loop.
 */
export const ALWAYS_PUBLIC_AUTH_PAGES = ['/auth/suspended']

export type AuthDecision =
  | { type: 'redirect'; to: string; reason: 'unauthenticated' | 'authenticated' }
  | { type: 'pass' }

/** True for /admin, /admin/users, /coach/x, /athlete/dashboard, … */
export function isProtectedPath(path: string): boolean {
  return Object.keys(PROTECTED_PATHS).some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  )
}

export function isAuthPage(path: string): boolean {
  return AUTH_PAGES.includes(path)
}

/**
 * Decide what the middleware must do for a given (locale-stripped) path.
 * Pure function — unit tested without any Next.js imports.
 */
export function resolveAuthGuard(
  path: string,
  hasRefreshCookie: boolean,
  locale: string
): AuthDecision {
  if (isProtectedPath(path)) {
    if (!hasRefreshCookie) {
      return {
        type: 'redirect',
        to: `/${locale}/auth/login`,
        reason: 'unauthenticated',
      }
    }
    return { type: 'pass' }
  }

  if (isAuthPage(path) && hasRefreshCookie) {
    // Role unknown here — RoleGuard bounces to the correct dashboard.
    return {
      type: 'redirect',
      to: `/${locale}/athlete/dashboard`,
      reason: 'authenticated',
    }
  }

  return { type: 'pass' }
}

/** Split "/en/admin/users" into ("en", "/admin/users"). Locale-agnostic. */
export function splitLocalePath(pathname: string): {
  locale: string
  path: string
} {
  const [, first, ...rest] = pathname.split('/')
  const locales = routing.locales as readonly string[]

  if (first && locales.includes(first)) {
    return { locale: first, path: `/${rest.join('/')}` }
  }
  return { locale: routing.defaultLocale, path: pathname }
}
