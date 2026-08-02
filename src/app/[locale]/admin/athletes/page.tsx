'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Users, Trophy, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FilterBar } from '@/components/admin/FilterBar'
import { PaginationControls } from '@/components/admin/PaginationControls'
import { useAdminAthletes } from '@/hooks/useAdmin'
import { Link } from '@/navigation'
import { formatDate } from '@/lib/utils'
import { exportToCsv, timestampedFilename } from '@/utils/csvExport'
import type { AdminAthlete } from '@/types'

export default function AdminAthletesPage() {
  const t = useTranslations('admin.athletes')
  const tc = useTranslations('common')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isError } = useAdminAthletes({
    search: debouncedSearch || undefined,
    status: status || undefined,
    date_from: dateFrom,
    date_to: dateTo,
    page,
  })

  const handleReset = () => {
    setSearch('')
    setStatus('')
    setDateFrom(undefined)
    setDateTo(undefined)
    setPage(1)
  }

  const handleExport = () => {
    if (!data) return
    exportToCsv<AdminAthlete>(
      timestampedFilename('athletes'),
      data.data,
      [
        { key: 'display_name', header: 'Name', value: (a) => a.display_name ?? '' },
        { key: 'email', header: 'Email', value: (a) => a.email },
        { key: 'status', header: 'Status', value: (a) => a.status },
        { key: 'sports_count', header: 'Sports', value: (a) => a.sports_count },
        { key: 'created_at', header: 'Joined', value: (a) => a.created_at },
      ]
    )
  }

  return (
    <div className="space-y-6">
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('searchPlaceholder')}
        options={[
          {
            name: 'status',
            label: tc('status'),
            value: status,
            onChange: (v) => { setStatus(v); setPage(1) },
            options: [
              { value: '', label: t('allStatuses') },
              { value: 'active', label: t('active') },
              { value: 'suspended', label: t('suspended') },
            ],
          },
        ]}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(d) => { setDateFrom(d.dateFrom); setDateTo(d.dateTo); setPage(1) }}
        onReset={handleReset}
        resetLabel={tc('reset')}
        onExport={handleExport}
        exportLabel={t('exportCsv')}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <>
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
          <PaginationControls
            meta={data.meta}
            onPageChange={setPage}
            ariaLabel={t('paginationLabel')}
            pageLabel={(p) => t('pageLabel', { page: p })}
            previousLabel={tc('previous')}
            nextLabel={tc('next')}
          />
        </>
      ) : (
        <EmptyState icon={Users} title={t('noAthletes')} description={debouncedSearch ? t('noSearchResults') : t('noAthletesDesc')} />
      )}
    </div>
  )
}
