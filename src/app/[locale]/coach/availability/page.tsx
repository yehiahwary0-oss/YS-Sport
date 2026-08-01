'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Plus, CalendarClock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { AddSlotModal } from '@/components/coach/AddSlotModal'
import { useAvailability, useDeleteSlot } from '@/hooks/useAvailability'
import { formatDate, formatDateTime } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

export default function AvailabilityPage() {
  const t = useTranslations('coach.availability')
  const [modalOpen, setModalOpen] = useState(false)

  const from = new Date().toISOString()
  const to = new Date(Date.now() + 30 * 24 * 60 * 60_000).toISOString()
  const { data, isLoading, isError } = useAvailability(from, to)
  const deleteSlot = useDeleteSlot()

  const groupedByDate = useMemo(() => {
    if (!data) return {}
    return data.data.reduce((acc, slot) => {
      const day = format(parseISO(slot.starts_at), 'EEEE, MMM d')
      if (!acc[day]) acc[day] = []
      acc[day].push(slot)
      return acc
    }, {} as Record<string, typeof data.data>)
  }, [data])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{t('description')}</p>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> {t('addSlot')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : Object.keys(groupedByDate).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([day, slots]) => (
            <div key={day}>
              <h3 className="mb-3 text-sm font-semibold text-zinc-300">{day}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => (
                  <div
                    key={slot.uuid}
                    className={`card flex items-center justify-between p-3.5 ${slot.is_booked ? 'border-green-500/30 bg-green-500/5' : ''}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {format(parseISO(slot.starts_at), 'h:mm a')} – {format(parseISO(slot.ends_at), 'h:mm a')}
                      </p>
                      <p className="text-xs text-zinc-500">{slot.is_booked ? t('booked') : t('available')}</p>
                    </div>
                    {!slot.is_booked && (
                      <button
                        onClick={() => deleteSlot.mutate(slot.uuid)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarClock}
          title={t('noSlots')}
          description={t('noSlotsDesc')}
          action={<Button onClick={() => setModalOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> {t('addSlot')}</Button>}
        />
      )}

      <AddSlotModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
