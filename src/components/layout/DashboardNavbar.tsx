'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell, Menu, LogOut, User as UserIcon, X } from 'lucide-react'

import { Avatar } from '@/components/ui/Avatar'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { notificationService } from '@/services/notification.service'
import type { NavItem } from './DashboardSidebar'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'

export function DashboardNavbar({
  title,
  mobileNavItems,
}: {
  title: string
  mobileNavItems: NavItem[]
}) {
  const t = useTranslations('nav')
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 30_000,
  })

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const notificationsHref = user?.role === 'coach' ? '/coach/notifications' : '/athlete/notifications'
  const profileHref = user?.role === 'coach' ? '/coach/profile' : '/athlete/profile'

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-navy-900/95 px-4 py-3.5 backdrop-blur-sm lg:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5 text-zinc-300" />
          </button>
          <h1 className="font-display text-lg font-semibold text-zinc-100">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href={notificationsHref} className="relative">
            <Bell className="h-5 w-5 text-zinc-400 hover:text-zinc-200" />
            {!!unreadCount && unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-2xs font-bold text-navy-900">
                {unreadCount > 9 ? '9' : unreadCount}
              </span>
            )}
          </Link>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button>
                <Avatar src={null} name={user?.email ?? 'U'} size="sm" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[180px] rounded-xl border border-zinc-800 bg-navy-800 p-1.5 shadow-2xl animate-fade-in"
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href={profileHref}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 outline-none hover:bg-navy-700"
                  >
                    <UserIcon className="h-4 w-4" /> {t('profile')}
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-zinc-800" />
                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 outline-none hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" /> {t('logOut')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-navy-900 lg:hidden">
          <div className="flex items-center justify-between px-6 py-6">
            <Logo />
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5 text-zinc-300" />
            </button>
          </div>
          <nav className="space-y-1 px-3">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium',
                    isActive ? 'bg-green-500/10 text-green-400' : 'text-zinc-300'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}
