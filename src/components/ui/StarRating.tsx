'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' }

export function StarRating({ value, onChange, size = 'md', readOnly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const displayValue = hover || value

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={cn(!readOnly && 'cursor-pointer transition-transform hover:scale-110', readOnly && 'cursor-default')}
        >
          <Star
            className={cn(
              sizeMap[size],
              star <= displayValue ? 'fill-amber-400 text-amber-400' : 'fill-none text-zinc-600'
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(sizeClass, star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-none text-zinc-700')}
        />
      ))}
    </div>
  )
}
