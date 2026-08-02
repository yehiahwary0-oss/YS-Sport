'use client'

import { Search, Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

export interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  secondarySearch?: string
  onSecondarySearchChange?: (value: string) => void
  secondarySearchPlaceholder?: string
  options?: Array<{
    name: string
    label: string
    value: string
    onChange: (value: string) => void
    options: FilterOption[]
    className?: string
  }>
  dateFrom?: string
  dateTo?: string
  onDateChange?: (dates: { dateFrom?: string; dateTo?: string }) => void
  dateLabels?: { from: string; to: string }
  onReset?: () => void
  resetLabel?: string
  onExport?: () => void
  exportLabel?: string
  showDates?: boolean
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  secondarySearch,
  onSecondarySearchChange,
  secondarySearchPlaceholder,
  options = [],
  dateFrom,
  dateTo,
  onDateChange,
  dateLabels = { from: 'From', to: 'To' },
  onReset,
  resetLabel = 'Reset',
  onExport,
  exportLabel,
  showDates = true,
}: FilterBarProps) {
  const hasActiveFilters = Boolean(
    search || secondarySearch || dateFrom || dateTo || options.some((o) => o.value)
  )

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      {onSearchChange && (
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="input-base pl-10"
          />
        </div>
      )}

      {onSecondarySearchChange && (
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={secondarySearch}
            onChange={(e) => onSecondarySearchChange(e.target.value)}
            placeholder={secondarySearchPlaceholder}
            aria-label={secondarySearchPlaceholder}
            className="input-base pl-10"
          />
        </div>
      )}

      {options.map((opt) => (
        <Select
          key={opt.name}
          value={opt.value}
          onChange={(e) => opt.onChange(e.target.value)}
          aria-label={opt.label}
          className={opt.className ?? 'lg:w-44'}
        >
          {opt.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      ))}

      {showDates && onDateChange && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom ?? ''}
            onChange={(e) => onDateChange({ dateFrom: e.target.value || undefined, dateTo })}
            aria-label={dateLabels.from}
            className="input-base lg:w-40"
          />
          <span className="text-zinc-600">–</span>
          <input
            type="date"
            value={dateTo ?? ''}
            onChange={(e) => onDateChange({ dateFrom, dateTo: e.target.value || undefined })}
            aria-label={dateLabels.to}
            className="input-base lg:w-40"
          />
        </div>
      )}

      {hasActiveFilters && onReset && (
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" /> {resetLabel}
        </Button>
      )}

      {onExport && (
        <Button
          size="sm"
          variant="secondary"
          className="gap-1.5"
          onClick={onExport}
          disabled={!onExport}
        >
          <Download className="h-3.5 w-3.5" /> {exportLabel}
        </Button>
      )}
    </div>
  )
}
