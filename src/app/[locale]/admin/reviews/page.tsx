'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Star, Check, X, Flag } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { StarDisplay } from '@/components/ui/StarRating'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { FilterBar } from '@/components/admin/FilterBar'
import { PaginationControls } from '@/components/admin/PaginationControls'
import { useAdminReviews, useApproveReview, useRejectReview } from '@/hooks/useAdmin'
import { timeAgo, cn } from '@/lib/utils'
import { exportToCsv, timestampedFilename } from '@/utils/csvExport'
import type { Review } from '@/types'

export default function AdminReviewsPage() {
  const t = useTranslations('admin.reviews')
  const tc = useTranslations('common')
  const tabs = [
    { label: t('tabReported'), value: { reported: true } },
    { label: t('tabPending'), value: { status: 'pending' } },
    { label: t('tabAll'), value: {} },
  ]
  const [activeTab, setActiveTab] = useState(0)
  const [rating, setRating] = useState('')
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useAdminReviews({
    ...tabs[activeTab].value,
    rating: rating ? Number(rating) : undefined,
    date_from: dateFrom,
    date_to: dateTo,
    page,
  })
  const approveReview = useApproveReview()
  const rejectReview = useRejectReview()

  const [target, setTarget] = useState<Review | null>(null)
  const [reason, setReason] = useState('')

  const handleReject = () => {
    if (!target) return
    rejectReview.mutate(
      { uuid: target.uuid, reason },
      { onSuccess: () => { setTarget(null); setReason('') } }
    )
  }

  const handleReset = () => {
    setRating('')
    setDateFrom(undefined)
    setDateTo(undefined)
    setPage(1)
  }

  const handleExport = () => {
    if (!data) return
    exportToCsv<Review>(
      timestampedFilename('reviews'),
      data.data,
      [
        { key: 'uuid', header: 'Review ID', value: (r) => r.uuid },
        { key: 'athlete', header: 'Athlete', value: (r) => r.athlete?.display_name ?? '' },
        { key: 'coach', header: 'Coach', value: (r) => r.coach?.display_name ?? '' },
        { key: 'rating', header: 'Rating', value: (r) => r.rating },
        { key: 'status', header: 'Status', value: (r) => r.status },
        { key: 'created_at', header: 'Created', value: (r) => r.created_at },
      ]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg bg-navy-800 p-1 w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => { setActiveTab(i); setPage(1) }}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === i ? 'bg-green-500 text-navy-900' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <FilterBar
        options={[
          {
            name: 'rating',
            label: t('rating'),
            value: rating,
            onChange: (v) => { setRating(v); setPage(1) },
            options: [
              { value: '', label: t('allRatings') },
              { value: '5', label: '5 ★' },
              { value: '4', label: '4 ★' },
              { value: '3', label: '3 ★' },
              { value: '2', label: '2 ★' },
              { value: '1', label: '1 ★' },
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
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : data && data.data.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.data.map((review) => (
              <div key={review.uuid} className="card p-4">
                <div className="flex items-start gap-3">
                  <Avatar src={review.athlete?.avatar_path} name={review.athlete?.display_name ?? '—'} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-200">{review.athlete?.display_name}</span>
                      <div className="flex items-center gap-2">
                        {review.reported_at && (
                          <span className="flex items-center gap-1 text-2xs text-red-400">
                            <Flag className="h-3 w-3" /> {t('reportedLabel')}
                          </span>
                        )}
                        <Badge status={review.status}>{review.status}</Badge>
                      </div>
                    </div>
                    <StarDisplay rating={review.rating} size="sm" />
                    {review.comment && <p className="mt-2 text-sm text-zinc-400">{review.comment}</p>}
                    <p className="mt-2 text-xs text-zinc-500">{timeAgo(review.created_at)}</p>

                    {review.status !== 'approved' && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="gap-1.5" onClick={() => approveReview.mutate(review.uuid)} isLoading={approveReview.isPending}>
                          <Check className="h-3 w-3" /> {t('approveButton')}
                        </Button>
                        <Button size="sm" variant="danger" className="gap-1.5" onClick={() => setTarget(review)}>
                          <X className="h-3 w-3" /> {t('rejectButton')}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
        <EmptyState icon={Star} title={t('noReviews')} description={t('noReviewsDesc')} />
      )}

      <Modal open={!!target} onOpenChange={(open) => !open && setTarget(null)} title={t('rejectButton')}>
        <Textarea
          label={t('reasonLabel')}
          placeholder={t('rejectPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button
          variant="danger"
          className="mt-5 w-full"
          onClick={handleReject}
          disabled={!reason.trim()}
          isLoading={rejectReview.isPending}
        >
          {t('rejectButton')}
        </Button>
      </Modal>
    </div>
  )
}
