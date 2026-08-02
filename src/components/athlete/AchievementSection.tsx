'use client'

import { useTranslations } from 'next-intl'
import { Award, Calendar } from 'lucide-react'
import type { Achievement } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils'

interface AchievementSectionProps {
  achievements: Achievement[]
}

function resolveAchievementText(
  achievement: Achievement,
  t: (key: string) => string,
): { name: string; description: string | null } {
  const nameKey = `achievements.${achievement.slug}.name`
  const descKey = `achievements.${achievement.slug}.description`
  const translatedName = t(nameKey)
  const translatedDesc = t(descKey)
  const isKnownKey = translatedName !== nameKey

  return {
    name: isKnownKey ? translatedName : achievement.name,
    description: isKnownKey ? translatedDesc : achievement.description,
  }
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const t = useTranslations()

  const { name, description } = resolveAchievementText(achievement, t)

  return (
    <div className="rounded-xl border border-zinc-800 bg-navy-800/50 p-4 transition-colors hover:border-zinc-700">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-700" aria-hidden="true">
          {achievement.icon ? (
            <span className="text-lg">{achievement.icon}</span>
          ) : (
            <Award className="h-5 w-5 text-green-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-100">{name}</p>
          {description && (
            <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{description}</p>
          )}
          <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-600">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            <time dateTime={achievement.earned_at}>
              {new Date(achievement.earned_at).toLocaleDateString()}
            </time>
            {achievement.sport_id && (
              <>
                <span aria-hidden="true">·</span>
                <span>{t('progression.sports')}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function AchievementCardSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse rounded-xl border border-zinc-800 bg-navy-800/50 p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-navy-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 rounded bg-navy-700" />
          <div className="h-3 w-56 rounded bg-navy-700" />
          <div className="h-3 w-24 rounded bg-navy-700" />
        </div>
      </div>
    </div>
  )
}

export function AchievementSection({ achievements }: AchievementSectionProps) {
  const t = useTranslations('achievements')

  if (achievements.length === 0) {
    return (
      <section aria-labelledby="achievements-heading">
        <h2 id="achievements-heading" className="mb-4 text-lg font-semibold text-zinc-100">
          {t('title')}
        </h2>
        <EmptyState
          icon={Award}
          title={t('noAchievements') ?? 'No achievements yet'}
        />
      </section>
    )
  }

  return (
    <section aria-labelledby="achievements-heading">
      <h2 id="achievements-heading" className="mb-4 flex flex-wrap items-center gap-2 text-lg font-semibold text-zinc-100">
        {t('title')}
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
          {t('unlockedCount', { count: achievements.length })}
        </span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <AchievementCard key={a.uuid} achievement={a} />
        ))}
      </div>
    </section>
  )
}

export function AchievementSectionSkeleton() {
  return (
    <section aria-labelledby="achievements-heading">
      <div className="mb-4 h-6 w-32 animate-pulse rounded bg-navy-700" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <AchievementCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}
