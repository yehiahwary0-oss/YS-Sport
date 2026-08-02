import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      {[1, 2, 3, 4].map((section) => (
        <div key={section}>
          <Skeleton className="mb-3 h-4 w-32" delay={section * 100} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="card h-24" delay={section * 100 + i * 60} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
