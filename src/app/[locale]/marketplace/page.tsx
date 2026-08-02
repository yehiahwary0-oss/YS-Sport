'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { SlidersHorizontal } from 'lucide-react'

import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { SearchBar } from '@/components/marketplace/SearchBar'
import { FilterPanel } from '@/components/marketplace/FilterPanel'
import { CoachCard, CoachCardSkeleton } from '@/components/marketplace/CoachCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useMarketplaceSearch, useSports } from '@/hooks/useMarketplace'
import { useToggleFavorite } from '@/hooks/useFavorites'
import { useAuthStore } from '@/store/auth.store'
import type { MarketplaceFilters } from '@/types'
import { Search as SearchIcon } from 'lucide-react'

export default function MarketplacePage() {
  const t = useTranslations('marketplace')
  const user = useAuthStore((s) => s.user)
  const [filters, setFilters] = useState<MarketplaceFilters>({ page: 1, per_page: 12 })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { data, isLoading, isError, isFetching } = useMarketplaceSearch(filters)
  const { data: sports } = useSports()
  const toggleFavorite = useToggleFavorite()

  const handleFilterChange = (newFilters: MarketplaceFilters) => {
    setFilters({ ...newFilters, page: 1 })
  }

  const handleReset = () => {
    setFilters({ q: filters.q, page: 1, per_page: 12 })
  }

  const handleFavorite = (uuid: string) => {
    if (!user || user.role !== 'athlete') return
    toggleFavorite.mutate(uuid)
  }

  return (
    <div id="main-content" className="min-h-screen bg-navy-900">
      <PublicNavbar />

      {/* Hero search */}
      <div className="border-b border-zinc-800 bg-gradient-hero py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold text-zinc-50 sm:text-3xl">{t('title')}</h1>
          <p className="mt-1.5 text-sm text-zinc-400">{t('subtitle')}</p>
          <SearchBar
            value={filters.q ?? ''}
            onChange={(q) => setFilters((f) => ({ ...f, q: q || undefined, page: 1 }))}
            className="mt-5 max-w-xl"
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Desktop filter sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="card sticky top-24 p-5">
              <FilterPanel
                sports={sports ?? []}
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleReset}
                t={t}
              />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {data ? t('resultsCount', { count: data.meta.total }) : ''}
              </p>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> {t('filters')}
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <CoachCardSkeleton key={i} />)}
              </div>
            ) : isError ? (
              <ErrorState onRetry={() => window.location.reload()} />
            ) : data && data.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {data.data.map((coach) => (
                    <CoachCard
                      key={coach.uuid}
                      coach={coach}
                      onToggleFavorite={user?.role === 'athlete' ? handleFavorite : undefined}
                      isFavoriting={toggleFavorite.isPending}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data.meta.last_page > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={filters.page === 1}
                      onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                    >
                      {t('previous')}
                    </Button>
                    <span className="px-3 text-sm text-zinc-400">
                      {t('pageOf', { current: data.meta.current_page, total: data.meta.last_page })}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={filters.page === data.meta.last_page}
                      onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                    >
                      {t('next')}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={SearchIcon}
                title={t('noResults')}
                description={t('noResultsDesc')}
                action={<Button variant="secondary" onClick={handleReset}>{t('resetFilters')}</Button>}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters modal */}
      <Modal open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen} title={t('filters')}>
        <FilterPanel
          sports={sports ?? []}
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          t={t}
        />
        <Button className="mt-6 w-full" onClick={() => setMobileFiltersOpen(false)}>
          {t('showResults')}
        </Button>
      </Modal>
    </div>
  )
}
