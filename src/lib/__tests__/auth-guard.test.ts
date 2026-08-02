import { describe, expect, it } from 'vitest'
import {
  isAuthPage,
  isProtectedPath,
  resolveAuthGuard,
  splitLocalePath,
} from '@/lib/auth-guard'

describe('isProtectedPath', () => {
  it('matches exact protected prefixes', () => {
    expect(isProtectedPath('/admin')).toBe(true)
    expect(isProtectedPath('/coach')).toBe(true)
    expect(isProtectedPath('/athlete')).toBe(true)
  })

  it('matches nested protected paths', () => {
    expect(isProtectedPath('/admin/users')).toBe(true)
    expect(isProtectedPath('/coach/dashboard')).toBe(true)
    expect(isProtectedPath('/athlete/bookings/abc-123')).toBe(true)
  })

  it('rejects public paths', () => {
    expect(isProtectedPath('/')).toBe(false)
    expect(isProtectedPath('/marketplace')).toBe(false)
    expect(isProtectedPath('/marketplace/coaches')).toBe(false)
    expect(isProtectedPath('/coaches/some-uuid')).toBe(false)
    expect(isProtectedPath('/auth/login')).toBe(false)
    expect(isProtectedPath('/administrator')).toBe(false)
  })
})

describe('isAuthPage', () => {
  it('recognizes auth pages', () => {
    expect(isAuthPage('/auth/login')).toBe(true)
    expect(isAuthPage('/auth/register')).toBe(true)
    expect(isAuthPage('/auth/forgot-password')).toBe(true)
    expect(isAuthPage('/auth/reset-password')).toBe(true)
    expect(isAuthPage('/auth/verify-email')).toBe(true)
  })

  it('keeps /auth/suspended always reachable', () => {
    expect(isAuthPage('/auth/suspended')).toBe(false)
  })
})

describe('resolveAuthGuard', () => {
  it('bounces unauthenticated users off protected pages', () => {
    expect(resolveAuthGuard('/admin', false, 'en')).toEqual({
      type: 'redirect',
      to: '/en/auth/login',
      reason: 'unauthenticated',
    })
    expect(resolveAuthGuard('/athlete/dashboard', false, 'ar')).toEqual({
      type: 'redirect',
      to: '/ar/auth/login',
      reason: 'unauthenticated',
    })
  })

  it('lets cookie-holders into protected pages', () => {
    expect(resolveAuthGuard('/admin/users', true, 'en')).toEqual({ type: 'pass' })
    expect(resolveAuthGuard('/coach/dashboard', true, 'en')).toEqual({ type: 'pass' })
  })

  it('bounces authenticated users off auth pages (generic dashboard)', () => {
    expect(resolveAuthGuard('/auth/login', true, 'en')).toEqual({
      type: 'redirect',
      to: '/en/athlete/dashboard',
      reason: 'authenticated',
    })
  })

  it('passes public pages regardless of session', () => {
    expect(resolveAuthGuard('/marketplace', false, 'en')).toEqual({ type: 'pass' })
    expect(resolveAuthGuard('/marketplace', true, 'en')).toEqual({ type: 'pass' })
    expect(resolveAuthGuard('/', false, 'en')).toEqual({ type: 'pass' })
    expect(resolveAuthGuard('/coaches/some-uuid', true, 'en')).toEqual({ type: 'pass' })
  })

  it('never bounces /auth/suspended (no redirect loop)', () => {
    expect(resolveAuthGuard('/auth/suspended', true, 'en')).toEqual({ type: 'pass' })
    expect(resolveAuthGuard('/auth/suspended', false, 'en')).toEqual({ type: 'pass' })
  })
})

describe('splitLocalePath', () => {
  it('strips a valid locale prefix', () => {
    expect(splitLocalePath('/en/admin/users')).toEqual({
      locale: 'en',
      path: '/admin/users',
    })
    expect(splitLocalePath('/ar/athlete/dashboard')).toEqual({
      locale: 'ar',
      path: '/athlete/dashboard',
    })
  })

  it('falls back to the default locale for locale-less paths', () => {
    expect(splitLocalePath('/marketplace')).toEqual({ locale: 'en', path: '/marketplace' })
    expect(splitLocalePath('/')).toEqual({ locale: 'en', path: '/' })
  })
})
