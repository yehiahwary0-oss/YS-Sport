'use client'

import { useTranslations } from 'next-intl'
import { NotificationList } from '@/components/notifications/NotificationList'

export default function NotificationsPage() {
  const t = useTranslations('notification')

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-100">{t('title')}</h1>
      <NotificationList />
    </div>
  )
}
