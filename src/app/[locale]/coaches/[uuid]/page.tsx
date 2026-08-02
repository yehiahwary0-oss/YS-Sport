'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MapPin, BadgeCheck, Heart, Calendar } from 'lucide-react'

import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { Avatar } from '@/components/ui/Avatar'
import { StarDisplay } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import { PackageCard } from '@/components/marketplace/PackageCard'
import { ReviewCard, ReviewCardSkeleton } from '@/components/marketplace/ReviewCard'
import { SendRequestModal } from '@/components/marketplace/SendRequestModal'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useCoachProfile, useCoachPackages, useCoachReviews } from '@/hooks/useMarketplace'
import { useToggleFavorite } from '@/hooks/useFavorites'
import { useAuthStore } from '@/store/auth.store'
import { formatRating, cn } from '@/lib/utils'
import type { PublicCoachPackage } from '@/types'
import { MessageSquare } from 'lucide-react'

export default function CoachDetailPage() {
  const t = useTranslations('marketplace.coachDetail')
  const { uuid } = useParams<{ uuid: string }>()
  const user = useAuthStore((s) => s.user)

  const { data: coach, isLoading, isError } = useCoachProfile(uuid)
  const { data: packages } = useCoachPackages(uuid)
  const { data: reviewsPage, isLoading: reviewsLoading, isError: reviewsError } = useCoachReviews(uuid)
  const toggleFavorite = useToggleFavorite()

  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [preselected, setPreselected] = useState<PublicCoachPackage | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900">
        <PublicNavbar />
        <FullPageSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-navy-900">
        <PublicNavbar />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <ErrorState onRetry={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-navy-900">
        <PublicNavbar />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState icon={MessageSquare} title={t('notFound')} description={t('notFoundDesc')} />
        </div>
      </div>
    )
  }

  const openRequestModal = (pkg?: PublicCoachPackage) => {
    if (pkg) setPreselected(pkg)
    setRequestModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <PublicNavbar />

      {/* Header */}
      <div className="border-b border-zinc-800 bg-gradient-hero">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <Avatar src={coach.avatar_url} name={coach.display_name} size="xl" ringStatus={coach.is_verified ? 'verified' : null} />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-zinc-50">{coach.display_name}</h1>
                {coach.is_verified && <BadgeCheck className="h-5 w-5 text-green-500" />}
              </div>

              {coach.location_city && (
                <div className="mt-1 flex items-center gap-1 text-sm text-zinc-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {coach.location_city}{coach.location_country ? `, ${coach.location_country}` : ''}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <StarDisplay rating={Number(coach.average_rating ?? 0)} size="md" />
                <span className="text-sm font-medium text-zinc-200">{formatRating(coach.average_rating)}</span>
                <span className="text-sm text-zinc-500">({t('reviewsCount', { count: coach.total_reviews })})</span>
                <span className="text-zinc-600">·</span>
                <span className="text-sm text-zinc-500">{t('sessions', { count: coach.total_sessions })}</span>
              </div>

              {coach.sports?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {coach.sports.map((sport) => (
                    <span key={sport.id} className="rounded-md bg-navy-700 px-2.5 py-1 text-xs font-medium text-zinc-400">
                      {sport.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {user?.role === 'athlete' && (
              <button
                onClick={() => toggleFavorite.mutate(coach.uuid)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 hover:bg-navy-800"
              >
                <Heart className={cn('h-5 w-5', coach.is_favorited ? 'fill-red-500 text-red-500' : 'text-zinc-400')} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {coach.bio && (
              <section>
                <h2 className="font-display text-lg font-semibold text-zinc-100">{t('about')}</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{coach.bio}</p>
                {coach.years_experience !== null && (
                  <p className="mt-2 text-sm text-zinc-500">
                    {t('experience', { years: coach.years_experience })}
                  </p>
                )}
              </section>
            )}

            <section>
              <h2 className="font-display text-lg font-semibold text-zinc-100">{t('reviews')}</h2>
              <div className="mt-3 card p-5">
                {reviewsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)
                ) : reviewsError ? (
                  <p className="py-6 text-center text-sm text-red-400">{t('reviewsFailed')}</p>
                ) : reviewsPage && reviewsPage.data.length > 0 ? (
                  reviewsPage.data.map((review) => <ReviewCard key={review.uuid} review={review} />)
                ) : (
                  <p className="py-6 text-center text-sm text-zinc-500">{t('noReviews')}</p>
                )}
              </div>
            </section>
          </div>

          {/* Packages sidebar */}
          <aside className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-zinc-100">{t('packages')}</h2>
            {packages && packages.length > 0 ? (
              packages.map((pkg) => (
                <PackageCard key={pkg.uuid} pkg={pkg} onSelect={() => openRequestModal(pkg)} />
              ))
            ) : (
              <p className="text-sm text-zinc-500">{t('noPackages')}</p>
            )}

            {coach.is_accepting_clients && packages && packages.length > 0 && (
              <Button className="w-full gap-2" size="lg" onClick={() => openRequestModal()}>
                <Calendar className="h-4 w-4" /> {t('bookSession')}
              </Button>
            )}
          </aside>
        </div>
      </div>

      {packages && (
        <SendRequestModal
          open={requestModalOpen}
          onOpenChange={setRequestModalOpen}
          coachUuid={coach.uuid}
          coachName={coach.display_name}
          packages={packages}
          preselectedPackage={preselected}
        />
      )}
    </div>
  )
}
