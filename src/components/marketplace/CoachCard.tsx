'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { MapPin, BadgeCheck, Heart } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { StarDisplay } from '@/components/ui/StarRating'
import { formatPrice, formatRating, cn } from '@/lib/utils'
import type { MarketplaceCoach } from '@/types'

interface CoachCardProps {
  coach: MarketplaceCoach
  onToggleFavorite?: (uuid: string) => void
  isFavoriting?: boolean
}

export function CoachCard({ coach, onToggleFavorite, isFavoriting }: CoachCardProps) {
  const t = useTranslations('marketplace.coachCard')
  const startingPrice = coach.packages?.length
    ? Math.min(...coach.packages.map((p) => Number(p.price_amount)))
    : null

  return (
    <div className="group relative card overflow-hidden transition-all hover:border-zinc-700 hover:shadow-card-hover">
      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite(coach.uuid)
          }}
          disabled={isFavoriting}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900/70 backdrop-blur-sm transition-colors hover:bg-navy-900"
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              coach.is_favorited ? 'fill-red-500 text-red-500' : 'text-zinc-300'
            )}
          />
        </button>
      )}

      <Link href={`/coaches/${coach.uuid}`} className="block p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar
            src={coach.avatar_url}
            name={coach.display_name}
            size="lg"
            ringStatus={coach.is_verified ? 'verified' : null}
          />
          <div className="flex-1 pt-0.5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-semibold text-zinc-100 group-hover:text-green-400 transition-colors">
                {coach.display_name}
              </h3>
              {coach.is_verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-green-500" />
              )}
            </div>

            {coach.location_city && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3 w-3" />
                {coach.location_city}
                {coach.location_country ? `, ${coach.location_country}` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="mt-3 flex items-center gap-2">
          <StarDisplay rating={Number(coach.average_rating ?? 0)} />
          <span className="text-sm font-medium text-zinc-300">{formatRating(coach.average_rating)}</span>
          <span className="text-xs text-zinc-500">({coach.total_reviews})</span>
        </div>

        {/* Sport tags */}
        {coach.sports?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {coach.sports.slice(0, 3).map((sport) => (
              <span
                key={sport.id}
                className="rounded-md bg-navy-700 px-2 py-0.5 text-2xs font-medium text-zinc-400"
              >
                {sport.name}
              </span>
            ))}
            {coach.sports.length > 3 && (
              <span className="rounded-md bg-navy-700 px-2 py-0.5 text-2xs font-medium text-zinc-500">
                +{coach.sports.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
          <div>
            {startingPrice !== null ? (
              <>
                <span className="text-xs text-zinc-500">From </span>
                <span className="font-display font-semibold text-zinc-100">{formatPrice(startingPrice)}</span>
              </>
            ) : (
              <span className="text-xs text-zinc-500">View packages</span>
            )}
          </div>
          <span className="text-xs font-medium text-green-400 group-hover:underline">{t('viewProfile')} →</span>
        </div>
      </Link>
    </div>
  )
}

export function CoachCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-16 w-16 rounded-full" delay={delay} />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-2/3" delay={delay + 60} />
          <Skeleton className="h-3 w-1/2" delay={delay + 120} />
        </div>
      </div>
      <Skeleton className="mt-4 h-3 w-1/3" delay={delay + 180} />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-16" delay={delay + 240} />
        <Skeleton className="h-5 w-16" delay={delay + 300} />
      </div>
    </div>
  )
}
