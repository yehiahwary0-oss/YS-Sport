'use client'

import { useTranslations } from 'next-intl'
import { Avatar } from '@/components/ui/Avatar'
import { Trophy } from 'lucide-react'

interface ProgressionHeaderProps {
  uuid: string
  displayName: string
  avatarUrl: string | null
}

export function ProgressionHeader({ uuid, displayName, avatarUrl }: ProgressionHeaderProps) {
  const t = useTranslations('progression')

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-navy-800/50 p-4 sm:p-6">
      <Avatar src={avatarUrl} name={displayName} size="lg" />
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl" id="progression-heading">
          {displayName}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
          <Trophy className="h-4 w-4 text-green-400" aria-hidden="true" />
          <span>{t('title')}</span>
        </p>
      </div>
    </div>
  )
}
