'use client'

import { useTranslations } from 'next-intl'
import { Lock } from 'lucide-react'

const LOCKED_ITEMS = [
  'reach_level_10',
  'earn_2500_xp',
  'complete_25_sessions',
  'try_3_sports',
] as const

export function LockedAchievements() {
  const t = useTranslations('achievements')

  return (
    <section aria-labelledby="locked-achievements-heading">
      <h2 id="locked-achievements-heading" className="mb-1 text-lg font-semibold text-zinc-100">
        {t('lockedTitle')}
      </h2>
      <p className="mb-4 text-sm text-zinc-500">{t('lockedDescription')}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LOCKED_ITEMS.map((key) => (
          <div
            key={key}
            className="flex items-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-navy-800/20 p-4 opacity-60 grayscale"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-800" aria-hidden="true">
              <Lock className="h-5 w-5 text-zinc-500" />
            </div>
            <p className="min-w-0 text-sm font-medium text-zinc-400">{t(`locked.${key}`)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
