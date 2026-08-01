import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { Calendar, Video } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import type { Booking } from '@/types'

interface BookingCardProps {
  booking: Booking
  viewerRole: 'athlete' | 'coach'
}

export function BookingCard({ booking, viewerRole }: BookingCardProps) {
  const t = useTranslations('booking.status')
  const other = viewerRole === 'athlete' ? booking.coach : booking.athlete
  const href = viewerRole === 'athlete' ? `/athlete/bookings/${booking.uuid}` : `/coach/bookings/${booking.uuid}`

  return (
    <Link href={href} className="card flex items-center gap-4 p-4 transition-colors hover:border-zinc-700">
      <Avatar src={other?.avatar_path} name={other?.display_name ?? '—'} size="md" />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-zinc-100">{other?.display_name}</span>
          <Badge status={booking.status}>{t(booking.status)}</Badge>
        </div>
        <p className="mt-0.5 text-sm text-zinc-500">{booking.package?.name}</p>

        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
          {booking.slot ? (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDateTime(booking.slot.starts_at)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <Calendar className="h-3.5 w-3.5" /> Time not yet scheduled
            </span>
          )}
          {booking.session_link && (
            <span className="flex items-center gap-1 text-green-400">
              <Video className="h-3.5 w-3.5" /> Link ready
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        <div className="font-display font-semibold text-zinc-100">
          {formatPrice(booking.price_amount, booking.price_currency)}
        </div>
      </div>
    </Link>
  )
}

export function BookingCardSkeleton() {
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
