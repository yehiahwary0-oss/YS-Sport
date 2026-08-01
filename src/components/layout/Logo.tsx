import { Link } from '@/navigation'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2 font-display font-bold', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-green text-navy-900">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z" fill="currentColor" />
        </svg>
      </div>
      <span className="text-lg tracking-tight text-zinc-50">YS Sports</span>
    </Link>
  )
}
