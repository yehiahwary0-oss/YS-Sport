'use client'

import * as Slider from '@radix-ui/react-slider'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Sport, MarketplaceFilters, MarketplaceSort } from '@/types'

interface FilterPanelProps {
  sports: Sport[]
  filters: MarketplaceFilters
  onChange: (filters: MarketplaceFilters) => void
  onReset: () => void
  className?: string
  t?: (key: string) => string
}

const SORT_OPTIONS: { value: MarketplaceSort | ''; labelKey: string }[] = [
  { value: '', labelKey: 'sortRecommended' },
  { value: 'rating', labelKey: 'sortRating' },
  { value: 'price_low_to_high', labelKey: 'sortPriceLow' },
  { value: 'price_high_to_low', labelKey: 'sortPriceHigh' },
  { value: 'experience', labelKey: 'sortExperience' },
  { value: 'newest', labelKey: 'sortNewest' },
]

export function FilterPanel({ sports, filters, onChange, onReset, className, t }: FilterPanelProps) {
  const hasActiveFilters = !!(filters.sport_id || filters.min_rating || filters.delivery_mode ||
    filters.min_price !== undefined || filters.max_price !== undefined || filters.sort ||
    filters.has_availability)

  const T = t ?? ((key: string) => {
    const fallback: Record<string, string> = {
      sortRecommended: 'Recommended',
      sortRating: 'Highest Rated',
      sortPriceLow: 'Price: Low to High',
      sortPriceHigh: 'Price: High to Low',
      sortExperience: 'Most Experienced',
      sortNewest: 'Newest',
    }
    return fallback[key] ?? key
  })

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-zinc-200">Filters</h3>
        {hasActiveFilters && (
          <button onClick={onReset} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300">
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="mb-2.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Sort By</label>
        <select
          value={filters.sort ?? ''}
          onChange={(e) => onChange({ ...filters, sort: (e.target.value || undefined) as MarketplaceSort | undefined })}
          className="w-full rounded-lg border border-zinc-700 bg-navy-800 px-3 py-2 text-sm text-zinc-200 focus:border-green-500 focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value || 'default'} value={opt.value}>
              {T(opt.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* Sport */}
      <div>
        <label className="mb-2.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Sport</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange({ ...filters, sport_id: undefined })}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              !filters.sport_id ? 'bg-green-500 text-navy-900' : 'bg-navy-700 text-zinc-400 hover:bg-navy-600'
            )}
          >
            All
          </button>
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => onChange({ ...filters, sport_id: sport.id })}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filters.sport_id === sport.id
                  ? 'bg-green-500 text-navy-900'
                  : 'bg-navy-700 text-zinc-400 hover:bg-navy-600'
              )}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-2.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            step={10}
            placeholder="Min"
            value={filters.min_price ?? ''}
            onChange={(e) => onChange({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-zinc-700 bg-navy-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-green-500 focus:outline-none"
          />
          <span className="text-zinc-500">—</span>
          <input
            type="number"
            min={0}
            step={10}
            placeholder="Max"
            value={filters.max_price ?? ''}
            onChange={(e) => onChange({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-zinc-700 bg-navy-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="mb-2.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Minimum Rating {filters.min_rating ? `· ${filters.min_rating}+` : ''}
        </label>
        <Slider.Root
          className="relative flex h-5 w-full touch-none items-center"
          value={[filters.min_rating ?? 0]}
          max={5}
          step={0.5}
          onValueChange={([v]) => onChange({ ...filters, min_rating: v > 0 ? v : undefined })}
        >
          <Slider.Track className="relative h-1.5 grow rounded-full bg-navy-700">
            <Slider.Range className="absolute h-full rounded-full bg-green-500" />
          </Slider.Track>
          <Slider.Thumb className="block h-4 w-4 rounded-full bg-green-500 shadow-glow-sm focus:outline-none" />
        </Slider.Root>
      </div>

      {/* Availability */}
      <div>
        <label className="mb-2.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Availability</label>
        <button
          onClick={() => onChange({ ...filters, has_availability: filters.has_availability ? undefined : true })}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
            filters.has_availability ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:bg-navy-700'
          )}
        >
          <div
            className={cn(
              'h-3.5 w-3.5 rounded-sm border-2',
              filters.has_availability ? 'border-green-500 bg-green-500' : 'border-zinc-600'
            )}
          />
          Available Now
        </button>
      </div>

      {/* Delivery mode */}
      <div>
        <label className="mb-2.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Delivery</label>
        <div className="space-y-2">
          {([
            { value: undefined, label: 'Any' },
            { value: 'online' as const, label: 'Online' },
            { value: 'in_person' as const, label: 'In Person' },
          ] as const).map((opt) => (
            <button
              key={opt.label}
              onClick={() => onChange({ ...filters, delivery_mode: opt.value })}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                filters.delivery_mode === opt.value
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-zinc-400 hover:bg-navy-700'
              )}
            >
              <div
                className={cn(
                  'h-3.5 w-3.5 rounded-full border-2',
                  filters.delivery_mode === opt.value ? 'border-green-500 bg-green-500' : 'border-zinc-600'
                )}
              />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
