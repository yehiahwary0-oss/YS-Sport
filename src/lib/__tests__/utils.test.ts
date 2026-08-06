import { describe, it, expect, vi, afterEach } from 'vitest'
import { cn, avatarUrl, formatPrice, formatDate, formatDateTime, timeAgo, formatRating, deliveryLabel, statusColor, getInitials } from '../utils'

describe('utils', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('cn merges class names', () => {
    expect(cn('a', 'b')).toContain('a')
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('avatarUrl returns the placeholder for empty paths', () => {
    expect(avatarUrl(null)).toBe('/images/avatar-placeholder.png')
    expect(avatarUrl('')).toBe('/images/avatar-placeholder.png')
    expect(avatarUrl(undefined)).toBe('/images/avatar-placeholder.png')
  })

  it('avatarUrl prefixes the CDN for valid paths', () => {
    vi.stubEnv('NEXT_PUBLIC_CDN_URL', 'https://cdn.example.com')
    expect(avatarUrl('/avatars/a.png')).toBe('https://cdn.example.com//avatars/a.png')
    vi.unstubAllEnvs()
    expect(avatarUrl('/avatars/a.png')).toBe('//avatars/a.png')
  })

  it('formatPrice formats with the given currency and locale', () => {
    expect(formatPrice('50')).toBe('$50')
    expect(formatPrice(50.5, 'USD', 'en-US')).toBe('$50.5')
    expect(formatPrice('25', 'EGP', 'ar-EG')).toContain('ج.م')
  })

  it('formatDate formats an ISO date', () => {
    expect(formatDate('2026-08-01T10:00:00Z')).toBe('Aug 1, 2026')
  })

  it('formatDateTime includes the time', () => {
    expect(formatDateTime('2026-08-01T10:00:00Z')).toMatch(/Aug 1, 2026/)
  })

  it('timeAgo returns a relative label', () => {
    const label = timeAgo(new Date(Date.now() - 60_000).toISOString())
    expect(label).toContain('minute')
  })

  it('formatRating handles missing and decimal ratings', () => {
    expect(formatRating(null)).toBe('—')
    expect(formatRating('')).toBe('—')
    expect(formatRating('4.55')).toBe('4.5')
    expect(formatRating(3)).toBe('3.0')
  })

  it('deliveryLabel maps known modes and falls back otherwise', () => {
    expect(deliveryLabel('online')).toBe('Online')
    expect(deliveryLabel('in_person')).toBe('In Person')
    expect(deliveryLabel('both')).toBe('Online & In Person')
    expect(deliveryLabel('unknown')).toBe('unknown')
  })

  it('statusColor returns the mapped class or the fallback', () => {
    expect(statusColor('pending')).toContain('amber')
    expect(statusColor('completed')).toContain('green')
    expect(statusColor('cancelled')).toContain('red')
    expect(statusColor('whatever')).toBe('text-zinc-400 bg-zinc-400/10')
  })

  it('getInitials takes the first two words uppercased', () => {
    expect(getInitials('John Doe')).toBe('JD')
    expect(getInitials('john')).toBe('J')
    expect(getInitials('Alice Bob Carol')).toBe('AB')
  })
})
