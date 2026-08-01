'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Users, Search, Trophy, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAdminAthletes } from '@/hooks/useAdmin'
import { Link } from '@/navigation'
import { formatDate } from '@/lib/utils'

export default function AdminAthletesPage() {
  const t = useTranslations('admin.athletes')
  const tc = useTranslations('common')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isError } = useAdminAthletes({ search: debouncedSearch || undefined, status: status || undefined, page })

  const meta = data?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="input-base pl-10"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          aria-label={tc('status')}
          className="input-base w-40"
        >
          <option value="">{t('allStatuses')}</option>
          <option value="active">{t('active')}</option>
          <option value="suspended">{t('suspended')}</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-navy-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('athlete')}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{tc('email')}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{tc('status')}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('sports')}</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('joined')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((athlete) => (
                <tr key={athlete.uuid} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-medium text-zinc-400">
                        {athlete.display_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-zinc-300">{athlete.display_name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{athlete.email}</td>
                  <td className="px-4 py-3"><Badge status={athlete.status}>{athlete.status}</Badge></td>
                  <td className="px-4 py-3 text-zinc-400">{athlete.sports_count}</td>
                  <td className="px-4 py-3 text-zinc-500">{formatDate(athlete.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {athlete.athlete_uuid && (
                      <Link
                        href={`/admin/athletes/${athlete.athlete_uuid}/progression`}
                        className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300"
                      >
                        <Trophy className="h-3.5 w-3.5" />
                        {t('viewProgression')}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Users} title={t('noAthletes')} description={debouncedSearch ? t('noSearchResults') : t('noAthletesDesc')} />
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2" role="navigation" aria-label={t('paginationLabel')}>
          <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label={tc('previous')}>
            {tc('previous')}
          </Button>
          {Array.from({ length: meta.last_page }).map((_, i) => (
            <Button
              key={i}
              size="sm"
              variant={meta.current_page === i + 1 ? 'primary' : 'ghost'}
              onClick={() => setPage(i + 1)}
              aria-label={t('pageLabel', { page: i + 1 })}
              aria-current={meta.current_page === i + 1 ? 'page' : undefined}
            >
              {i + 1}
            </Button>
          ))}
          <Button size="sm" variant="ghost" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} aria-label={tc('next')}>
            {tc('next')}
          </Button>
        </div>
      )}
    </div>
  )
}
