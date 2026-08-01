'use client'

import { Link, usePathname } from '@/navigation'
import { type LucideIcon } from 'lucide-react'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

export function DashboardSidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 border-r border-zinc-800 bg-navy-900 lg:flex lg:flex-col">
      <div className="px-6 py-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:bg-navy-800 hover:text-zinc-200'
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </span>
              {!!item.badge && item.badge > 0 && (
                <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-2xs font-bold text-navy-900">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
