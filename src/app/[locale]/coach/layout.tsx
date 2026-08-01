'use client'

import { useTranslations } from 'next-intl'
import { LayoutDashboard, Package, CalendarClock, Inbox, Calendar, User, DollarSign, Bell } from 'lucide-react'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { DashboardSidebar, type NavItem } from '@/components/layout/DashboardSidebar'
import { DashboardNavbar } from '@/components/layout/DashboardNavbar'
import { usePathname } from '@/navigation'
import { useQuery } from '@tanstack/react-query'
import { serviceRequestService } from '@/services/service-request.service'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('coach.nav')
  const pathname = usePathname()

  const titleMap: Record<string, string> = {
    '/coach/dashboard': t('dashboard'),
    '/coach/packages': t('packages'),
    '/coach/availability': t('availability'),
    '/coach/requests': t('requests'),
    '/coach/bookings': t('bookings'),
    '/coach/earnings': t('earnings'),
    '/coach/notifications': t('notifications'),
    '/coach/profile': t('profile'),
  }

  const title = Object.entries(titleMap).find(([path]) => pathname.startsWith(path))?.[1] ?? t('dashboard')

  const { data: pendingRequests } = useQuery({
    queryKey: ['coach', 'service-requests', 'pending', 'count'],
    queryFn: () => serviceRequestService.listCoach('pending'),
    refetchInterval: 30_000,
  })

  const { data: unreadCount } = useUnreadNotificationCount()

  const navItems: NavItem[] = [
    { label: t('dashboard'), href: '/coach/dashboard', icon: LayoutDashboard },
    { label: t('packages'), href: '/coach/packages', icon: Package },
    { label: t('availability'), href: '/coach/availability', icon: CalendarClock },
    { label: t('requests'), href: '/coach/requests', icon: Inbox, badge: pendingRequests?.meta.total },
    { label: t('bookings'), href: '/coach/bookings', icon: Calendar },
    { label: t('earnings'), href: '/coach/earnings', icon: DollarSign },
    { label: t('notifications'), href: '/coach/notifications', icon: Bell, badge: unreadCount },
    { label: t('profile'), href: '/coach/profile', icon: User },
  ]

  return (
    <RoleGuard allowedRoles={['coach']}>
      <div className="flex min-h-screen bg-navy-900">
        <DashboardSidebar items={navItems} />
        <div className="flex-1">
          <DashboardNavbar title={title} mobileNavItems={navItems} />
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  )
}
