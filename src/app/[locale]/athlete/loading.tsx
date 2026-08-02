import { Skeleton } from '@/components/ui/Skeleton'

export default function AthleteLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      {/* Welcome */}
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-72" delay={60} />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5">
            <Skeleton className="h-3 w-28" delay={i * 100} />
            <Skeleton className="mt-3 h-8 w-12" delay={i * 100 + 60} />
          </div>
        ))}
      </div>

      {/* Upcoming bookings list */}
      <div>
        <Skeleton className="mb-4 h-4 w-44" delay={150} />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="card h-20" delay={200 + i * 100} />
          ))}
        </div>
      </div>
    </div>
  )
}
