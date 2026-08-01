'use client'

import { useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'
import { CoachCard, CoachCardSkeleton } from '@/components/marketplace/CoachCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { useFavoritesList } from '@/hooks/useFavoritesList'
import { useToggleFavorite } from '@/hooks/useFavorites'
import { Link } from '@/navigation'

export default function FavoritesPage() {
  const t = useTranslations('athlete.favorites')
  const { data, isLoading, isError } = useFavoritesList()
  const toggleFavorite = useToggleFavorite()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => <CoachCardSkeleton key={i} />)}
      </div>
    )
  }

  if (isError) {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title={t('noFavorites')}
        description={t('noFavoritesDesc')}
        action={<Link href="/marketplace"><Button>{t('browseCoaches')}</Button></Link>}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {data.data.map((coach) => (
        <CoachCard
          key={coach.uuid}
          coach={{ ...coach, is_favorited: true }}
          onToggleFavorite={(uuid) => toggleFavorite.mutate(uuid)}
          isFavoriting={toggleFavorite.isPending}
        />
      ))}
    </div>
  )
}
