'use client'

import { useTranslations } from 'next-intl'
import { Activity, ShieldCheck, ShieldAlert, Ban, RotateCcw, CheckCircle2, Star, StarOff, CreditCard, Banknote } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { timeAgo } from '@/lib/utils'
import type { AuditLogEntry } from '@/services/admin.service'

import type { LucideIcon } from 'lucide-react'

const ACTION_ICONS: Record<string, LucideIcon> = {
  'user.suspended': Ban,
  'user.reactivated': RotateCcw,
  'coach.verified': CheckCircle2,
  'coach.rejected': ShieldAlert,
  'coach.featured': ShieldCheck,
  'payment.confirmed': CreditCard,
  'payment.refunded': Banknote,
  'review.approved': Star,
  'review.rejected': StarOff,
}

interface ActivityFeedProps {
  items: AuditLogEntry[]
  title?: string
}

function actionLabel(t: (key: string) => string, action: string): string {
  const key = action.replaceAll('.', '_')
  const mapped = ACTION_LABEL_KEYS[key]
  if (mapped) return t(mapped)
  return action.replaceAll('.', ' ')
}

const ACTION_LABEL_KEYS: Record<string, string> = {
  user_suspended: 'actionUserSuspended',
  user_reactivated: 'actionUserReactivated',
  coach_verified: 'actionCoachVerified',
  coach_rejected: 'actionCoachRejected',
  coach_featured: 'actionCoachFeatured',
  payment_confirmed: 'actionPaymentConfirmed',
  payment_refunded: 'actionPaymentRefunded',
  review_approved: 'actionReviewApproved',
  review_rejected: 'actionReviewRejected',
}

export function ActivityFeed({ items, title }: ActivityFeedProps) {
  const t = useTranslations('admin.activity')

  if (items.length === 0) {
    return <EmptyState icon={Activity} title={title ?? t('emptyTitle')} description={t('emptyDesc')} />
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-zinc-800 px-5 py-4">
        <h3 className="font-display text-sm font-semibold text-zinc-100">{title ?? t('title')}</h3>
      </div>
      <ul className="divide-y divide-zinc-800/50">
        {items.map((entry) => {
          const Icon = ACTION_ICONS[entry.action] ?? Activity
          return (
            <li key={entry.id} className="flex items-start gap-3 px-5 py-3.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-700 text-zinc-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-300">
                  {actionLabel(t, entry.action)}
                  {entry.notes ? <span className="text-zinc-500"> — {entry.notes}</span> : null}
                </p>
                <p className="mt-0.5 text-2xs text-zinc-600">
                  {entry.admin ? entry.admin.email : '—'} · {timeAgo(entry.created_at)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
