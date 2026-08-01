'use client'

import { useTranslations } from 'next-intl'
import { Trophy, Target, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  totalXp: number
  totalSports: number
  primarySport: string | null
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-zinc-800 bg-navy-800/50 p-4',
        className,
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-700">
        <Icon className="h-5 w-5 text-green-400" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <p className="mt-0.5 truncate text-lg font-bold text-zinc-100">{value}</p>
      </div>
    </div>
  )
}

export function SummaryCards({ totalXp, totalSports, primarySport }: SummaryCardsProps) {
  const t = useTranslations('progression')

  return (
    <div className="grid gap-3 sm:grid-cols-3" role="list" aria-label={t('title')}>
      <div role="listitem">
        <SummaryCard
          icon={Trophy}
          label={t('total_xp', { count: 0 }).replace('0', '')}
          value={t('total_xp', { count: totalXp })}
        />
      </div>
      <div role="listitem">
        <SummaryCard
          icon={Target}
          label={t('total_sports', { count: 0 }).replace('0', '')}
          value={t('total_sports', { count: totalSports })}
        />
      </div>
      <div role="listitem">
        <SummaryCard
          icon={Star}
          label={t('primary_sport')}
          value={primarySport ?? '—'}
        />
      </div>
    </div>
  )
}
