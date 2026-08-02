'use client'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface PaginationMeta {
  current_page: number
  last_page: number
  total: number
  per_page: number
}

interface PaginationControlsProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  className?: string
  ariaLabel?: string
  pageLabel?: (page: number) => string
  previousLabel?: string
  nextLabel?: string
}

function pageWindow(current: number, lastPage: number): number[] {
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, i) => i + 1)
  const pages = new Set<number>([1, lastPage, current - 1, current, current + 1])
  return [...pages].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b)
}

export function PaginationControls({
  meta,
  onPageChange,
  className,
  ariaLabel = 'Pagination',
  pageLabel = (page) => `Page ${page}`,
  previousLabel = 'Previous',
  nextLabel = 'Next',
}: PaginationControlsProps) {
  const { current_page: current, last_page: lastPage } = meta

  if (lastPage <= 1) return null

  const pages = pageWindow(current, lastPage)

  return (
    <div
      className={cn('flex items-center justify-center gap-1.5 pt-2', className)}
      role="navigation"
      aria-label={ariaLabel}
    >
      <Button
        size="sm"
        variant="ghost"
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
        aria-label={previousLabel}
      >
        {previousLabel}
      </Button>

      {pages.map((page, i) => {
        const isGap = i > 0 && pages[i - 1] !== page - 1
        return (
          <div key={page} className="flex items-center gap-1.5">
            {isGap && <span className="px-1 text-xs text-zinc-600">…</span>}
            <Button
              size="sm"
              variant={current === page ? 'primary' : 'ghost'}
              onClick={() => onPageChange(page)}
              aria-label={pageLabel(page)}
              aria-current={current === page ? 'page' : undefined}
            >
              {page}
            </Button>
          </div>
        )
      })}

      <Button
        size="sm"
        variant="ghost"
        disabled={current >= lastPage}
        onClick={() => onPageChange(current + 1)}
        aria-label={nextLabel}
      >
        {nextLabel}
      </Button>
    </div>
  )
}
