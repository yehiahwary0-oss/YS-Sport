'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  delta?: number | null
  deltaLabel?: string
  highlight?: boolean
  action?: boolean
}

export function MetricCard({ icon: Icon, label, value, delta, deltaLabel, highlight, action }: MetricCardProps) {
  const hasDelta = typeof delta === 'number'
  const up = (delta ?? 0) >= 0

  return (
    <div
      className={cn(
        'card flex items-center justify-between p-5',
        highlight && 'border-amber-500/40 bg-amber-500/5',
        action && 'transition-colors hover:border-green-500/40'
      )}
    >
      <div>
        <div className="flex items-center gap-2 text-zinc-500">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className="mt-2 font-display text-2xl font-bold text-zinc-50">{value}</p>
        {hasDelta && (
          <p className={cn('mt-1 inline-flex items-center gap-1 text-2xs font-medium', up ? 'text-green-400' : 'text-red-400')}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {deltaLabel}
          </p>
        )}
      </div>
      {action && <ArrowRight className="h-4 w-4 text-zinc-500" />}
    </div>
  )
}
