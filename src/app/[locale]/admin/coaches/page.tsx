'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShieldCheck, Check, X, FileText } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { FilterBar } from '@/components/admin/FilterBar'
import { PaginationControls } from '@/components/admin/PaginationControls'
import { usePendingCoaches, useAdminCoaches, useVerifyCoach, useRejectCoach } from '@/hooks/useAdmin'
import { timeAgo } from '@/lib/utils'
import { exportToCsv, timestampedFilename } from '@/utils/csvExport'
import type { CoachProfile } from '@/types'

export default function AdminCoachVerificationPage() {
  const t = useTranslations('admin.coaches')
  const tc = useTranslations('common')
  const [tab, setTab] = useState<'pending' | 'all'>('pending')

  const [search, setSearch] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('')
  const [page, setPage] = useState(1)

  const pending = usePendingCoaches()
  const all = useAdminCoaches({
    search: search || undefined,
    verification_status: verificationStatus || undefined,
    page,
  })
  const verifyCoach = useVerifyCoach()
  const rejectCoach = useRejectCoach()

  const [rejectTarget, setRejectTarget] = useState<CoachProfile | null>(null)
  const [reason, setReason] = useState('')

  const handleReject = () => {
    if (!rejectTarget) return
    rejectCoach.mutate(
      { uuid: rejectTarget.uuid, reason },
      { onSuccess: () => { setRejectTarget(null); setReason('') } }
    )
  }

  const handleReset = () => {
    setSearch('')
    setVerificationStatus('')
    setPage(1)
  }

  const handleExport = () => {
    if (!all.data) return
    exportToCsv<CoachProfile>(
      timestampedFilename('coaches'),
      all.data.data,
      [
        { key: 'display_name', header: 'Name', value: (c) => c.display_name },
        { key: 'email', header: 'Email', value: (c) => c.user?.email ?? '' },
        { key: 'verification_status', header: 'Verification', value: (c) => c.verification_status },
        { key: 'location_city', header: 'City', value: (c) => c.location_city ?? '' },
        { key: 'avg_rating', header: 'Rating', value: (c) => c.avg_rating ?? '' },
      ]
    )
  }

  const isLoading = tab === 'pending' ? pending.isLoading : all.isLoading
  const isError = tab === 'pending' ? pending.isError : all.isError
  const list = tab === 'pending' ? pending.data?.data ?? [] : all.data?.data ?? []
  const meta = tab === 'pending' ? undefined : all.data?.meta

  return (
    <div className="space-y-6">
      <SegmentedControl
        options={[
          { label: t('pendingTitle'), value: 'pending' },
          { label: t('allCoaches'), value: 'all' },
        ]}
        value={tab}
        onChange={(v) => {
          setTab(v as 'pending' | 'all')
          setPage(1)
        }}
        size="sm"
      />

      {tab === 'all' && (
        <FilterBar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1) }}
          searchPlaceholder={t('searchPlaceholder')}
          options={[
            {
              name: 'verification_status',
              label: t('verificationStatus'),
              value: verificationStatus,
              onChange: (v) => { setVerificationStatus(v); setPage(1) },
              options: [
                { value: '', label: t('filterAll') },
                { value: 'pending', label: t('pendingTitle') },
                { value: 'verified', label: t('verifiedTitle') },
                { value: 'rejected', label: t('rejectedTitle') },
              ],
            },
          ]}
          onReset={handleReset}
          resetLabel={tc('reset')}
          onExport={handleExport}
          exportLabel={t('exportCsv')}
          showDates={false}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={tab === 'pending' ? t('noPending') : t('noCoaches')}
          description={tab === 'pending' ? t('allReviewed') : t('noCoachesDesc')}
        />
      ) : (
        <>
          <div className="space-y-4">
            {list.map((coach) => (
              <div key={coach.uuid} className="card p-5">
                <div className="flex items-start gap-4">
                  <Avatar src={coach.avatar_path} name={coach.display_name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-zinc-100">{coach.display_name}</h3>
                      <span className="text-xs text-zinc-500">
                        {tab === 'pending' ? t('applied') : t('joinedOn')} {timeAgo(coach.created_at)}
                      </span>
                    </div>

                    {coach.location_city && (
                      <p className="mt-0.5 text-sm text-zinc-500">
                        {coach.location_city}{coach.location_country ? `, ${coach.location_country}` : ''}
                      </p>
                    )}

                    {coach.bio && <p className="mt-2 text-sm text-zinc-400">{coach.bio}</p>}

                    {coach.years_experience !== null && (
                      <p className="mt-2 text-xs text-zinc-500">{t('yearsExperience', { years: coach.years_experience })}</p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-xs">
                      {coach.certificate_path ? (
                        <a
                          href={`/api/v1/admin/coaches/${coach.uuid}/certificate`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-400 hover:text-green-300"
                        >
                          <FileText className="h-3.5 w-3.5" /> {t('viewCertificate')}
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-zinc-500">
                          <FileText className="h-3.5 w-3.5" /> {t('noCertificate')}
                        </span>
                      )}
                    </div>

                    {coach.sports?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {coach.sports.map((sport) => (
                          <span key={sport.id} className="rounded-md bg-navy-700 px-2 py-0.5 text-2xs font-medium text-zinc-400">
                            {sport.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {tab === 'pending' && (
                      <div className="mt-4 flex gap-3">
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => verifyCoach.mutate(coach.uuid)}
                          isLoading={verifyCoach.isPending}
                        >
                          <Check className="h-3.5 w-3.5" /> {t('verifyButton')}
                        </Button>
                        <Button size="sm" variant="danger" className="gap-1.5" onClick={() => setRejectTarget(coach)}>
                          <X className="h-3.5 w-3.5" /> {t('rejectButton')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <PaginationControls
              meta={meta}
              onPageChange={setPage}
              ariaLabel={t('paginationLabel')}
              pageLabel={(p) => t('pageLabel', { page: p })}
              previousLabel={tc('previous')}
              nextLabel={tc('next')}
            />
          )}
        </>
      )}

      <Modal open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)} title={t('rejectButton')}>
        <Textarea
          label={t('reasonLabel')}
          placeholder={t('rejectPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setRejectTarget(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleReject} disabled={!reason.trim()} isLoading={rejectCoach.isPending}>
            {t('rejectApplication')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
