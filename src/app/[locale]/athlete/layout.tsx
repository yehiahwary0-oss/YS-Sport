'use client'

import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Calendar,
  Send,
  Heart,
  User,
  Bell,
  CreditCard,
  Gift,
  TrendingUp,
  ClipboardList,
  Bot,
} from 'lucide-react'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { DashboardSidebar, type NavItem } from '@/components/layout/DashboardSidebar'
import { DashboardNavbar } from '@/components/layout/DashboardNavbar'
import { usePathname } from '@/navigation'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'

export default function AthleteLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('athlete.nav')
  const pathname = usePathname()
  const { data: unreadCount } = useUnreadNotificationCount()

  const titleMap: Record<string, string> = {
    '/athlete/dashboard': t('dashboard'),
    '/athlete/bookings': t('myBookings'),
    '/athlete/requests': t('myRequests'),
    '/athlete/payments': t('payments'),
    '/athlete/favorites': t('favorites'),
    '/athlete/notifications': t('notifications'),
    '/athlete/profile': t('profile'),
    '/athlete/referral': t('referral'),
    '/athlete/progression': t('progression'),
    '/athlete/training-plans': t('trainingPlans'),
    '/athlete/ai-coach': t('aiCoach'),
  }

  const title = Object.entries(titleMap).find(([path]) => pathname.startsWith(path))?.[1] ?? t('dashboard')

  const navItems: NavItem[] = [
    { label: t('dashboard'), href: '/athlete/dashboard', icon: LayoutDashboard },
    { label: t('myBookings'), href: '/athlete/bookings', icon: Calendar },
    { label: t('myRequests'), href: '/athlete/requests', icon: Send },
    { label: t('payments'), href: '/athlete/payments', icon: CreditCard },
    { label: t('favorites'), href: '/athlete/favorites', icon: Heart },
    { label: t('notifications'), href: '/athlete/notifications', icon: Bell, badge: unreadCount },
    { label: t('referral'), href: '/athlete/referral', icon: Gift },
    { label: t('progression'), href: '/athlete/progression', icon: TrendingUp },
    { label: t('trainingPlans'), href: '/athlete/training-plans', icon: ClipboardList },
    { label: t('aiCoach'), href: '/athlete/ai-coach', icon: Bot },
    { label: t('profile'), href: '/athlete/profile', icon: User },
  ]

  return (
    <RoleGuard allowedRoles={['athlete']}>
      <div className="flex min-h-screen bg-navy-900">
        <DashboardSidebar items={navItems} />
        <div className="flex-1">
          <DashboardNavbar title={title} mobileNavItems={navItems} />
          <main id="main-content" className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  )
}
