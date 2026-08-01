'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Inbox } from 'lucide-react'
import { ServiceRequestCard, ServiceRequestCardSkeleton } from '@/components/shared/ServiceRequestCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useCoachServiceRequests } from '@/hooks/useServiceRequest'
import { cn } from '@/lib/utils'

export default function CoachRequestsPage() {
  const t = useTranslations('coach.requests')
  const [status, setStatus] = useState<string | undefined>('pending')
  const tabs = [
    { label: t('pending'), value: 'pending' },
    { label: t('accepted'), value: 'accepted' },
    { label: t('rejected'), value: 'rejected' },
    { label: t('all'), value: undefined },
  ]
  const { data, isLoading, isError } = useCoachServiceRequests(status)

  return (
    <div className="space-y-6">
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-navy-800 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setStatus(tab.value)}
            className={cn(
              'flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              status === tab.value ? 'bg-green-500 text-navy-900' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <ServiceRequestCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((request) => (
            <ServiceRequestCard key={request.uuid} request={request} viewerRole="coach" />
          ))}
        </div>
      ) : (
        <EmptyState icon={Inbox} title={t('noRequests')} description={t('noRequestsDesc')} />
      )}
    </div>
  )
}
