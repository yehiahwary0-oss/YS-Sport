import { Avatar } from '@/components/ui/Avatar'
import { StarDisplay } from '@/components/ui/StarRating'
import { timeAgo } from '@/lib/utils'
import type { Review } from '@/types'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b border-zinc-800 py-5 last:border-0">
      <div className="flex items-start gap-3">
        <Avatar src={review.athlete?.avatar_path} name={review.athlete?.display_name ?? 'Athlete'} size="sm" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-200">{review.athlete?.display_name}</span>
            <span className="text-xs text-zinc-500">{timeAgo(review.created_at)}</span>
          </div>
          <StarDisplay rating={review.rating} size="sm" />
          {review.comment && <p className="mt-2 text-sm text-zinc-400">{review.comment}</p>}

          {review.coach_reply && (
            <div className="mt-3 rounded-lg bg-navy-700/50 p-3">
              <span className="text-xs font-semibold text-green-400">Coach reply</span>
              <p className="mt-1 text-sm text-zinc-400">{review.coach_reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="flex items-start gap-3 border-b border-zinc-800 py-5 last:border-0">
      <div className="h-8 w-8 animate-pulse rounded-full bg-navy-700" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-navy-700" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-navy-700" />
      </div>
    </div>
  )
}
