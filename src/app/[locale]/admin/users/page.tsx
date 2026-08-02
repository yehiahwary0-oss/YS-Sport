'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Users, Ban, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FilterBar } from '@/components/admin/FilterBar'
import { PaginationControls } from '@/components/admin/PaginationControls'
import { useAdminUsers, useSuspendUser, useReactivateUser } from '@/hooks/useAdmin'
import { formatDate } from '@/lib/utils'
import { exportToCsv, timestampedFilename } from '@/utils/csvExport'
import type { AdminUser } from '@/services/admin.service'

export default function AdminUsersPage() {
  const t = useTranslations('admin.users')
  const tc = useTranslations('common')

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useAdminUsers({
    search: search || undefined,
    role: role || undefined,
    status: status || undefined,
    date_from: dateFrom,
    date_to: dateTo,
    page,
  })
  const suspendUser = useSuspendUser()
  const reactivateUser = useReactivateUser()

  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null)
  const [reason, setReason] = useState('')

  const handleSuspend = () => {
    if (!suspendTarget) return
    suspendUser.mutate(
      { uuid: suspendTarget.uuid, reason },
      { onSuccess: () => { setSuspendTarget(null); setReason('') } }
    )
  }

  const handleReset = () => {
    setSearch('')
    setRole('')
    setStatus('')
    setDateFrom(undefined)
    setDateTo(undefined)
    setPage(1)
  }

  const handleExport = () => {
    if (!data) return
    exportToCsv<AdminUser>(
      timestampedFilename('users'),
      data.data,
      [
        { key: 'email', header: 'Email', value: (u) => u.email },
        { key: 'role', header: 'Role', value: (u) => u.role },
        { key: 'status', header: 'Status', value: (u) => u.status },
        { key: 'created_at', header: 'Joined', value: (u) => u.created_at },
      ]
    )
  }

  return (
    <div className="space-y-6">
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder={t('searchPlaceholder')}
        options={[
          {
            name: 'role',
            label: t('role'),
            value: role,
            onChange: (v) => { setRole(v); setPage(1) },
            options: [
              { value: '', label: t('filterAll') },
              { value: 'athlete', label: t('filterAthletes') },
              { value: 'coach', label: t('filterCoaches') },
            ],
          },
          {
            name: 'status',
            label: tc('status'),
            value: status,
            onChange: (v) => { setStatus(v); setPage(1) },
            options: [
              { value: '', label: t('filterAll') },
              { value: 'active', label: t('statusActive') },
              { value: 'suspended', label: t('statusSuspended') },
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
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('email')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('role')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{tc('status')}</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">{t('joined')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((user) => (
                  <tr key={user.uuid} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-4 py-3 text-zinc-300">{user.email}</td>
                    <td className="px-4 py-3 capitalize text-zinc-400">{user.role}</td>
                    <td className="px-4 py-3"><Badge status={user.status}>{user.status}</Badge></td>
                    <td className="px-4 py-3 text-zinc-500">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== 'admin' && (
                        user.status === 'suspended' ? (
                          <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => reactivateUser.mutate(user.uuid)}>
                            <RotateCcw className="h-3 w-3" /> {t('reactivateButton')}
                          </Button>
                        ) : (
                          <Button size="sm" variant="danger" className="gap-1.5" onClick={() => setSuspendTarget(user)}>
                            <Ban className="h-3 w-3" /> {t('suspendButton')}
                          </Button>
                        )
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
        <EmptyState icon={Users} title={t('noUsers')} description={t('noUsersDesc')} />
      )}

      <Modal open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)} title={t('suspendButton')}>
        <p className="mb-4 text-sm text-zinc-400">
          {t('suspendWarning', { email: suspendTarget?.email ?? '' })}
        </p>
        <Textarea
          label={t('reasonLabel')}
          placeholder={t('suspendPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button
          variant="danger"
          className="mt-5 w-full"
          onClick={handleSuspend}
          disabled={!reason.trim()}
          isLoading={suspendUser.isPending}
        >
          {t('suspendButton')}
        </Button>
      </Modal>
    </div>
  )
}
