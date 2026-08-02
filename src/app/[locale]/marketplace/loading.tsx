import { Skeleton } from '@/components/ui/Skeleton'
import { CoachCardSkeleton } from '@/components/marketplace/CoachCard'

export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-navy-900" aria-busy="true" aria-label="Loading marketplace">
      {/* Hero search */}
      <div className="border-b border-zinc-800 bg-gradient-hero py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96 max-w-full" delay={60} />
          <Skeleton className="mt-5 h-11 max-w-xl rounded-lg" delay={120} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Filter sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="card sticky top-24 space-y-4 p-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4" delay={i * 60} />
              ))}
            </div>
          </aside>

          {/* Coach cards */}
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CoachCardSkeleton key={i} delay={i * 100} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
