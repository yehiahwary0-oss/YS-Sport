'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { PayoutStatus } from '@/types/payout'

const payoutStatusClasses: Record<PayoutStatus, string> = {
  pending: 'text-amber-400 bg-amber-400/10',
  approved: 'text-blue-400 bg-blue-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  sent: 'text-green-500 bg-green-500/10',
  rejected: 'text-red-400 bg-red-400/10',
  failed: 'text-red-400 bg-red-400/10',
}

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  const t = useTranslations('coach.payouts')

  return (
    <Badge status={status} className={cn(payoutStatusClasses[status])}>
      {t(`status_${status}`)}
    </Badge>
  )
}
