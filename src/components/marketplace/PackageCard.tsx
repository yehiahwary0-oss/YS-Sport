import { Clock, Video, MapPin } from 'lucide-react'
import { formatPrice, deliveryLabel, cn } from '@/lib/utils'
import type { CoachPackage } from '@/types'

interface PackageCardProps {
  pkg: CoachPackage
  selected?: boolean
  onSelect?: (pkg: CoachPackage) => void
}

const tierColors: Record<string, string> = {
  basic: 'border-zinc-700',
  standard: 'border-blue-500/40',
  premium: 'border-green-500/50',
}

export function PackageCard({ pkg, selected, onSelect }: PackageCardProps) {
  return (
    <button
      onClick={() => onSelect?.(pkg)}
      className={cn(
        'w-full rounded-xl border-2 p-5 text-left transition-all',
        selected ? 'border-green-500 bg-green-500/5' : tierColors[pkg.tier_label ?? 'basic'],
        onSelect && 'hover:border-green-500/60 cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          {pkg.tier_label && (
            <span className="text-2xs font-semibold uppercase tracking-wide text-green-400">
              {pkg.tier_label}
            </span>
          )}
          <h3 className="mt-0.5 font-display font-semibold text-zinc-100">{pkg.name}</h3>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-bold text-zinc-50">
            {formatPrice(pkg.price_amount, pkg.price_currency)}
          </div>
        </div>
      </div>

      {pkg.description && <p className="mt-2 text-sm text-zinc-400">{pkg.description}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {pkg.session_count} session{pkg.session_count > 1 ? 's' : ''} · {pkg.session_duration_minutes}min
        </span>
        <span className="flex items-center gap-1">
          {pkg.delivery_mode === 'online' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
          {deliveryLabel(pkg.delivery_mode)}
        </span>
      </div>
    </button>
  )
}
