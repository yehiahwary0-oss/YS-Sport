'use client'

import { useTranslations } from 'next-intl'
import { LayoutDashboard, ShieldCheck, DollarSign, Banknote, Users, Calendar, Star, Medal, Tag, Trophy, Activity } from 'lucide-react'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { DashboardSidebar, type NavItem } from '@/components/layout/DashboardSidebar'
import { DashboardNavbar } from '@/components/layout/DashboardNavbar'
import { usePathname } from '@/navigation'
import { useAdminMetrics } from '@/hooks/useAdmin'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin.nav')
  const pathname = usePathname()
  const { data: metrics } = useAdminMetrics()

  const titleMap: Record<string, string> = {
    '/admin/dashboard': t('dashboard'),
    '/admin/coaches': t('coachVerification'),
    '/admin/payments': t('payments'),
    '/admin/payouts': t('payouts'),
    '/admin/users': t('users'),
    '/admin/bookings': t('bookings'),
    '/admin/reviews': t('reviews'),
    '/admin/featured-coaches': t('featuredCoaches'),
    '/admin/promo-codes': t('promoCodes'),
    '/admin/achievements': t('achievements'),
    '/admin/athletes': t('athletes'),
  }

  const title = Object.entries(titleMap).find(([path]) => pathname.startsWith(path))?.[1] ?? t('dashboard')

  const navItems: NavItem[] = [
    { label: t('dashboard'), href: '/admin/dashboard', icon: LayoutDashboard },
    { label: t('coachVerification'), href: '/admin/coaches', icon: ShieldCheck, badge: metrics?.coaches.pending_verification },
    { label: t('payments'), href: '/admin/payments', icon: DollarSign, badge: Number(metrics?.revenue.pending) > 0 ? 1 : undefined },
    { label: t('payouts'), href: '/admin/payouts', icon: Banknote, badge: metrics?.payouts.pending },
    { label: t('users'), href: '/admin/users', icon: Users },
    { label: t('bookings'), href: '/admin/bookings', icon: Calendar },
    { label: t('reviews'), href: '/admin/reviews', icon: Star },
    { label: t('featuredCoaches'), href: '/admin/featured-coaches', icon: Medal },
    { label: t('promoCodes'), href: '/admin/promo-codes', icon: Tag },
    { label: t('achievements'), href: '/admin/achievements', icon: Trophy },
    { label: t('athletes'), href: '/admin/athletes', icon: Activity },
  ]

  return (
    <RoleGuard allowedRoles={['admin']}>
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
