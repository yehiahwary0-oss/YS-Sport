'use client'

import { useTranslations } from 'next-intl'
import { Star } from 'lucide-react'
import type { SportProgression } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface SportProgressionCardProps {
  sport: SportProgression
}

const tierBadgeColor: Record<string, string> = {
  bronze: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  silver: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
  gold:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  elite:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// A percentage progress bar is intentionally absent. The API only provides
// `xp` (total XP in this sport) and `xp_to_next_level` (XP needed to advance),
// but not the XP threshold for the current level. Computing a percentage
// without that value would require duplicating the backend formula.
export function SportProgressionCard({ sport }: SportProgressionCardProps) {
  const t = useTranslations('progression')

  const tierKey = sport.tier as keyof typeof tierBadgeColor
  const tierLabel = t(`tiers.${sport.tier}`)

  return (
    <div className="rounded-xl border border-zinc-800 bg-navy-800/50 p-4 transition-colors hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-zinc-100">
              {sport.sport.name}
            </h3>
            {sport.is_primary && (
              <Star className="h-4 w-4 shrink-0 fill-green-400 text-green-400" aria-label={t('primary')} />
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-500">{t('level', { level: sport.level })}</p>
        </div>
        <Badge className={cn('border capitalize', tierBadgeColor[tierKey] ?? tierBadgeColor.bronze)}>
          {tierLabel}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-500">{t('xp', { count: 0 }).replace('0', '')}</p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-200">
            {t('xp', { count: sport.xp })}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-500">{t('xp_to_next_level', { count: 0 }).replace('0', '')}</p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-200">
            {t('xp_to_next_level', { count: sport.xp_to_next_level })}
          </p>
        </div>
      </div>
    </div>
  )
}

export function SportProgressionCardSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse rounded-xl border border-zinc-800 bg-navy-800/50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 rounded bg-navy-700" />
          <div className="h-4 w-20 rounded bg-navy-700" />
        </div>
        <div className="h-6 w-16 rounded-full bg-navy-700" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="h-3 w-12 rounded bg-navy-700" />
          <div className="h-4 w-16 rounded bg-navy-700" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-16 rounded bg-navy-700" />
          <div className="h-4 w-20 rounded bg-navy-700" />
        </div>
      </div>
    </div>
  )
}
