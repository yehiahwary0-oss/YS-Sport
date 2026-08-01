import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { Clock } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, timeAgo } from '@/lib/utils'
import type { ServiceRequest } from '@/types'

interface ServiceRequestCardProps {
  request: ServiceRequest
  viewerRole: 'athlete' | 'coach'
}

export function ServiceRequestCard({ request, viewerRole }: ServiceRequestCardProps) {
  const t = useTranslations('booking.serviceRequestStatus')
  const other = viewerRole === 'athlete' ? request.coach : request.athlete
  const href = viewerRole === 'athlete' ? `/athlete/requests/${request.uuid}` : `/coach/requests/${request.uuid}`

  return (
    <Link href={href} className="card flex items-center gap-4 p-4 transition-colors hover:border-zinc-700">
      <Avatar src={other?.avatar_path} name={other?.display_name ?? '—'} size="md" />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-100">{other?.display_name}</span>
          <Badge status={request.status}>{t(request.status)}</Badge>
        </div>
        <p className="mt-0.5 text-sm text-zinc-500">{request.package_name}</p>

        {request.status === 'pending' && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
            <Clock className="h-3.5 w-3.5" /> Expires {timeAgo(request.expires_at)}
          </div>
        )}
      </div>

      <div className="text-right">
        <div className="font-display font-semibold text-zinc-100">
          {formatPrice(request.price_amount, request.price_currency)}
        </div>
      </div>
    </Link>
  )
}

export function ServiceRequestCardSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className="h-11 w-11 animate-pulse rounded-full bg-navy-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 animate-pulse rounded bg-navy-700" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-navy-700" />
      </div>
    </div>
  )
}
