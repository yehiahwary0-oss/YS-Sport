'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Trophy, Medal, Award, Activity, BarChart3, Flame, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAdminAthleteProgression, useAdminAthleteXpEvents } from '@/hooks/useAdmin'
import { Link } from '@/navigation'
import { formatDate } from '@/lib/utils'
import { GrantXpDialog } from './GrantXpDialog'
import type { SportProgression, XpEvent } from '@/types'

const tierColors: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-slate-400',
  gold: 'text-yellow-400',
  elite: 'text-purple-400',
}

const sourceIcons: Record<string, typeof Trophy> = {
  booking: Activity,
  achievement: Award,
  admin_grant: Medal,
}

export default function AdminAthleteProgressionPage() {
  const t = useTranslations('admin.athletes')
  const tc = useTranslations('common')
  const { uuid } = useParams<{ uuid: string }>()
  const { data: progression, isLoading, isError } = useAdminAthleteProgression(uuid)
  const [xpPage, setXpPage] = useState(1)
  const [grantXpOpen, setGrantXpOpen] = useState(false)
  useEffect(() => { setXpPage(1) }, [uuid])
  const { data: xpEventsData } = useAdminAthleteXpEvents(uuid, { page: xpPage })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="card h-48 animate-pulse" />
        <div className="card h-64 animate-pulse" />
      </div>
    )
  }

  if (isError || !progression) {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  const { athlete, summary, sports, achievements } = progression
  const xpEvents = xpEventsData?.data ?? []
  const xpMeta = xpEventsData?.meta

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/athletes"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-zinc-400 hover:bg-navy-700 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-700 text-base font-semibold text-zinc-300">
              {athlete.display_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{athlete.display_name}</h1>
              <p className="text-sm text-zinc-500">
                {t('joinedDate', { date: formatDate(athlete.joined_at) })}
              </p>
            </div>
          </div>
        </div>
        <Button size="sm" onClick={() => setGrantXpOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          {t('grantXpButton')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">{t('totalXp')}</p>
            <p className="text-lg font-bold text-white">{summary.total_xp}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">{t('totalSports')}</p>
            <p className="text-lg font-bold text-white">{summary.total_sports}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">{t('totalAchievements')}</p>
            <p className="text-lg font-bold text-white">{summary.total_achievements}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">{t('totalXpEvents')}</p>
            <p className="text-lg font-bold text-white">{summary.total_xp_events}</p>
          </div>
        </div>
      </div>

      {/* Sport Progression */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">{t('sportProgression')}</h2>
        {sports.length === 0 ? (
          <p className="text-sm text-zinc-600">{t('noSports')}</p>
        ) : (
          <div className="space-y-3">
            {sports.map((sp: SportProgression) => (
              <div key={sp.sport.id} className="rounded-lg bg-navy-800/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-300">{sp.sport.name}</span>
                    {sp.is_primary && (
                      <Badge status="active" className="text-[10px]">{t('primary')}</Badge>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${tierColors[sp.tier] ?? 'text-zinc-400'}`}>
                    {t('tier', { tier: sp.tier })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>{t('level', { level: sp.level })}</span>
                  <span>{t('xp', { xp: sp.xp })}</span>
                  <span>{t('xpToNext', { xp: sp.xp_to_next_level })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">{t('achievements')}</h2>
        {achievements.length === 0 ? (
          <p className="text-sm text-zinc-600">{t('noAchievements')}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map((ach) => (
              <div key={ach.uuid} className="flex items-start gap-3 rounded-lg bg-navy-800/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                  <Trophy className="h-4 w-4 text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-300">{ach.name}</p>
                  {ach.description && <p className="mt-0.5 text-xs text-zinc-500">{ach.description}</p>}
                  <p className="mt-1 text-[11px] text-zinc-600">{formatDate(ach.earned_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* XP Events */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">{t('xpEvents')}</h2>
        {xpEvents.length === 0 ? (
          <p className="text-sm text-zinc-600">{t('noXpEvents')}</p>
        ) : (
          <>
            <div className="divide-y divide-zinc-800/50">
              {xpEvents.map((event: XpEvent) => {
                const SourceIcon = sourceIcons[event.source_type] ?? Trophy
                return (
                  <div key={event.uuid} className="flex items-start gap-3 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10">
                      <SourceIcon className="h-4 w-4 text-brand-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-zinc-300">{event.reason}</p>
                        <span className="text-sm font-medium text-green-400">+{event.xp_amount}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                        <span>{formatDate(event.created_at)}</span>
                        <span>·</span>
                        <Badge status="default" className="text-[10px]">{event.source_type}</Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {xpMeta && xpMeta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4" role="navigation" aria-label={t('paginationLabel')}>
                <Button size="sm" variant="ghost" disabled={xpPage <= 1} onClick={() => setXpPage(xpPage - 1)} aria-label={tc('previous')}>
                  {tc('previous')}
                </Button>
                {Array.from({ length: Math.min(xpMeta.last_page, 10) }).map((_, i) => {
                  const pageNum = xpMeta.last_page <= 10 ? i + 1 : Math.max(1, xpPage - 4) + i
                  if (pageNum > xpMeta.last_page) return null
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={xpMeta.current_page === pageNum ? 'primary' : 'ghost'}
                      onClick={() => setXpPage(pageNum)}
                      aria-label={t('pageLabel', { page: pageNum })}
                      aria-current={xpMeta.current_page === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button size="sm" variant="ghost" disabled={xpPage >= xpMeta.last_page} onClick={() => setXpPage(xpPage + 1)} aria-label={tc('next')}>
                  {tc('next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <GrantXpDialog
        open={grantXpOpen}
        onOpenChange={setGrantXpOpen}
        athleteUuid={uuid}
        athleteName={athlete.display_name}
        sportOptions={sports.map((sp: SportProgression) => ({ id: sp.sport.id, name: sp.sport.name }))}
      />
    </div>
  )
}
