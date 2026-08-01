import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ── Class merging ──────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Avatar URL ─────────────────────────────────────────────────

export function avatarUrl(path: string | null | undefined): string {
  if (!path) return '/images/avatar-placeholder.png'
  const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? ''
  return `${cdn}/${path}`
}

// ── Currency formatting ────────────────────────────────────────

export function formatPrice(amount: string | number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

// ── Date formatting ────────────────────────────────────────────

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy')
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'MMM d, yyyy · h:mm a')
}

export function timeAgo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

// ── Rating ─────────────────────────────────────────────────────

export function formatRating(rating: string | number | null): string {
  if (!rating) return '—'
  return Number(rating).toFixed(1)
}

// ── Delivery mode label ────────────────────────────────────────

export function deliveryLabel(mode: string): string {
  return { online: 'Online', in_person: 'In Person', both: 'Online & In Person' }[mode] ?? mode
}

// ── Status badge color ─────────────────────────────────────────

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    pending:   'text-amber-400 bg-amber-400/10',
    confirmed: 'text-blue-400 bg-blue-400/10',
    completed: 'text-green-500 bg-green-500/10',
    cancelled: 'text-red-400 bg-red-400/10',
    no_show:   'text-zinc-400 bg-zinc-400/10',
    accepted:  'text-green-500 bg-green-500/10',
    rejected:  'text-red-400 bg-red-400/10',
    paid:      'text-green-500 bg-green-500/10',
    refunded:  'text-amber-400 bg-amber-400/10',
    verified:  'text-green-500 bg-green-500/10',
    unverified:'text-zinc-400 bg-zinc-400/10',
  }
  return map[status] ?? 'text-zinc-400 bg-zinc-400/10'
}

// ── Truncate text ──────────────────────────────────────────────

export function truncate(text: string, length: number = 120): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

// ── Get initials for avatar fallback ──────────────────────────

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
