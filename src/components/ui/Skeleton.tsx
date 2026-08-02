import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  /** Stagger delay in ms (list items: index * 100). */
  delay?: number
}

/**
 * Shimmering skeleton placeholder.
 * The gradient sweep is a CSS animation (see .skeleton-shimmer in globals.css),
 * so it works without JS and respects reduced-motion.
 */
export function Skeleton({ className, delay = 0 }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton-shimmer rounded bg-navy-700', className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    />
  )
}
