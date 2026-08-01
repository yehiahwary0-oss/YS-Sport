import { cn } from '@/lib/utils'
import { statusColor } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  status?: string
  className?: string
}

export function Badge({ children, status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        status ? statusColor(status) : 'bg-zinc-700 text-zinc-300',
        className
      )}
    >
      {children}
    </span>
  )
}
