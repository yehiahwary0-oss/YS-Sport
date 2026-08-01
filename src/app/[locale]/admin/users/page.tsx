'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Users, Search, Ban, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useAdminUsers, useSuspendUser, useReactivateUser } from '@/hooks/useAdmin'
import { formatDate } from '@/lib/utils'
import type { AdminUser } from '@/services/admin.service'

export default function AdminUsersPage() {
  const t = useTranslations('admin.users')
  const tc = useTranslations('common')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined)
  const { data, isLoading, isError } = useAdminUsers({ search: search || undefined, role: roleFilter })
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="input-base pl-10"
          />
        </div>
        <SegmentedControl
          options={[
            { label: t('filterAll'), value: undefined },
            { label: t('filterAthletes'), value: 'athlete' },
            { label: t('filterCoaches'), value: 'coach' },
          ]}
          value={roleFilter}
          onChange={setRoleFilter}
          size="sm"
        />
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
