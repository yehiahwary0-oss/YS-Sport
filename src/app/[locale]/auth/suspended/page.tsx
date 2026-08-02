'use client'

import { useTranslations } from 'next-intl'
import { LifeBuoy, House } from 'lucide-react'
import { Link } from '@/navigation'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function SuspendedPage() {
  const t = useTranslations('auth')
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL

  return (
    <AuthLayout title={t('suspendedTitle')}>
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <LifeBuoy className="h-6 w-6 text-red-400" aria-hidden="true" />
        </div>

        <p className="max-w-sm text-sm text-zinc-400">{t('suspendedMessage')}</p>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {supportEmail && (
            <a href={`mailto:${supportEmail}`} className="btn-danger flex-1">
              <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              {t('contactSupport')}
            </a>
          )}
          <Link href="/" className="btn-secondary flex-1">
            <House className="h-4 w-4" aria-hidden="true" />
            {t('backHome')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
