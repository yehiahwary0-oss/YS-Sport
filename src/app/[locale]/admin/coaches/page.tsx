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
import { usePendingCoaches, useVerifyCoach, useRejectCoach } from '@/hooks/useAdmin'
import { timeAgo } from '@/lib/utils'
import type { CoachProfile } from '@/types'

export default function AdminCoachVerificationPage() {
  const t = useTranslations('admin.coaches')
  const { data, isLoading, isError } = usePendingCoaches()
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}
      </div>
    )
  }

  if (isError) {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  if (!data || data.data.length === 0) {
    return <EmptyState icon={ShieldCheck} title={t('noPending')} description={t('allReviewed')} />
  }

  return (
    <div className="space-y-4">
      {data.data.map((coach) => (
        <div key={coach.uuid} className="card p-5">
          <div className="flex items-start gap-4">
            <Avatar src={coach.avatar_path} name={coach.display_name} size="lg" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-zinc-100">{coach.display_name}</h3>
                <span className="text-xs text-zinc-500">{t('applied')} {timeAgo(coach.created_at)}</span>
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
            </div>
          </div>
        </div>
      ))}

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
