'use client'

import { useLocale, useTranslations } from 'next-intl'
import { CalendarDays, Trophy } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

interface ProgressionHeaderProps {
  uuid: string
  displayName: string
  avatarUrl: string | null
  bio?: string | null
  joinedAt?: string | null
  online?: boolean
}

function formatDate(iso: string, locale: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function ProgressionHeader({
  uuid,
  displayName,
  avatarUrl,
  bio,
  joinedAt,
  online,
}: ProgressionHeaderProps) {
  const t = useTranslations('progression')
  const locale = useLocale()
  const memberSince = joinedAt ? formatDate(joinedAt, locale) : null

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-zinc-800 bg-navy-800/50 p-4 sm:items-center sm:p-6">
      <div className="relative shrink-0">
        <Avatar src={avatarUrl} name={displayName} size="lg" />
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5" aria-label={t('online')}>
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"
              aria-hidden="true"
            />
            <span
              className="relative flex h-4 w-4 rounded-full border-2 border-navy-900 bg-emerald-400"
              aria-hidden="true"
            />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl" id="progression-heading">
          {displayName}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
          <Trophy className="h-4 w-4 text-green-400" aria-hidden="true" />
          <span>{t('title')}</span>
        </p>
        {bio && <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{bio}</p>}
        {memberSince && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            <time dateTime={joinedAt ?? undefined}>{t('member_since', { date: memberSince })}</time>
          </p>
        )}
      </div>
    </div>
  )
}
