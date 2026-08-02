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

const tierLevelColor: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-slate-300',
  gold:   'text-yellow-400',
  elite:  'text-purple-400',
}

// The API only exposes `xp` (total XP in this sport) and `xp_to_next_level`
// (XP still needed to advance), but not the XP threshold of the current
// level, so an exact progress percentage is not computable. As an
// approximation we assume a linear curve and derive the level "size" as
// xp + xp_to_next_level. The exact numbers are shown in the tooltip.
function xpProgress(xp: number, xpToNextLevel: number): number {
  const total = xp + xpToNextLevel
  if (total <= 0) return 0
  return Math.round((xp / total) * 100)
}

export function SportProgressionCard({ sport }: SportProgressionCardProps) {
  const t = useTranslations('progression')

  const tierKey = sport.tier as keyof typeof tierBadgeColor
  const tierLabel = t(`tiers.${sport.tier}`)
  const progress = xpProgress(sport.xp, sport.xp_to_next_level)

  return (
    <div
      className={cn(
        'rounded-xl border bg-navy-800/50 p-4 transition-colors',
        sport.is_primary
          ? 'border-emerald-400/40 shadow-[0_0_28px_-8px_rgba(0,230,118,0.5)] ring-1 ring-emerald-400/30'
          : 'border-zinc-800 hover:border-zinc-700',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-zinc-100">
              {sport.sport.name}
            </h3>
            {sport.is_primary && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                <Star className="h-3.5 w-3.5 fill-emerald-400" aria-label={t('primary')} />
                <span>{t('primary')}</span>
              </span>
            )}
          </div>
        </div>
        <Badge className={cn('border capitalize', tierBadgeColor[tierKey] ?? tierBadgeColor.bronze)}>
          {tierLabel}
        </Badge>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span
          className={cn('text-5xl font-extrabold leading-none tracking-tight', tierLevelColor[tierKey] ?? tierLevelColor.bronze)}
        >
          {sport.level}
        </span>
        <span className="pb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
          {t('level_caption')}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={t('xp_progress', { sport: sport.sport.name })}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        title={t('xp_tooltip', { xp: sport.xp, total: sport.xp + sport.xp_to_next_level })}
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-navy-700"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
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
      <div className="mt-4 h-12 w-16 rounded bg-navy-700" />
      <div className="mt-4 h-2 w-full rounded-full bg-navy-700" />
      <div className="mt-3 grid grid-cols-2 gap-3">
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
