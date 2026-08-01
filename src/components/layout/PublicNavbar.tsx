'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/navigation'
import { Logo } from './Logo'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

export function PublicNavbar() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)

  const dashboardHref = user?.role === 'coach' ? '/coach/dashboard' : '/athlete/dashboard'

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-navy-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/marketplace"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === '/marketplace' ? 'text-green-400' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {t('findCoaches')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {user ? (
            <Link href={dashboardHref}>
              <Button size="sm">{t('dashboard')}</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">{t('logIn')}</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">{t('signUp')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
