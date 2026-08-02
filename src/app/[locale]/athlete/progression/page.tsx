'use client'

import { useTranslations } from 'next-intl'
import { Award, Swords } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useAthleteProgression, usePublicAthleteProgression } from '@/hooks/useAthleteProgression'
import { ProgressionHeader } from '@/components/athlete/ProgressionHeader'
import { SummaryCards } from '@/components/athlete/SummaryCards'
import { SportProgressionCard, SportProgressionCardSkeleton } from '@/components/athlete/SportProgressionCard'
import { AchievementSection, AchievementSectionSkeleton } from '@/components/athlete/AchievementSection'
import { LockedAchievements } from '@/components/athlete/LockedAchievements'
import { XpHistorySection } from '@/components/athlete/XpHistorySection'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { FullPageSpinner } from '@/components/ui/Spinner'

export default function AthleteProgressionPage() {
  const t = useTranslations('progression')
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, error, refetch } = useAthleteProgression()
  const { data: publicProfile } = usePublicAthleteProgression(user?.uuid)

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label={t('loading')}>
        <div aria-hidden="true" className="h-24 animate-pulse rounded-2xl bg-navy-800/50" />
        <div aria-hidden="true" className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-navy-800/50" />
          ))}
        </div>
        <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SportProgressionCardSkeleton key={i} />
          ))}
        </div>
        <div aria-hidden="true">
          <AchievementSectionSkeleton />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6" role="alert">
        <ProgressionHeader
          uuid={user?.uuid ?? ''}
          displayName={user?.email ?? ''}
          avatarUrl={null}
        />
        <ErrorState
          title={t('error')}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  if (!data) {
    return <FullPageSpinner />
  }

  const { athlete, summary, sports, achievements } = data.data
  const online = user?.status === 'active'

  return (
    <div className="space-y-6">
      <section aria-labelledby="progression-heading">
        <ProgressionHeader
          uuid={athlete.uuid}
          displayName={athlete.display_name}
          avatarUrl={athlete.avatar_url}
          bio={publicProfile?.data.athlete.bio ?? null}
          joinedAt={publicProfile?.data.joined_at ?? null}
          online={online}
        />
      </section>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="sr-only">{t('summary')}</h2>
        <SummaryCards
          totalXp={summary.total_xp}
          totalSports={summary.total_sports}
          primarySport={
            sports.find((s) => s.is_primary)?.sport.name ?? null
          }
        />
      </section>

      <section aria-labelledby="sports-heading">
        <h2 id="sports-heading" className="mb-4 text-lg font-semibold text-zinc-100">
          {t('sports')}
        </h2>
        {sports.length === 0 ? (
          <EmptyState
            icon={Swords}
            title={t('no_sports')}
            description={t('no_sports_desc')}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sports.map((sp) => (
              <SportProgressionCard key={`${sp.sport.id}`} sport={sp} />
            ))}
          </div>
        )}
      </section>

      <AchievementSection achievements={achievements} />
      <LockedAchievements />
      <XpHistorySection />
    </div>
  )
}
