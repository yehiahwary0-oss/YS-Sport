'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Star, Plus, Pencil, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  useFeaturedCoachesAdmin,
  useCreateFeaturedCoach,
  useUpdateFeaturedCoach,
  useDeleteFeaturedCoach,
} from '@/hooks/useAdmin'
import { formatDate } from '@/lib/utils'
import type { FeaturedCoach } from '@/types'

interface FormData {
  coach_id: string
  position: string
  starts_at: string
  ends_at: string
  reason: string
}

const emptyForm: FormData = { coach_id: '', position: '', starts_at: '', ends_at: '', reason: '' }

export default function AdminFeaturedCoachesPage() {
  const t = useTranslations('admin.featuredCoaches')
  const tc = useTranslations('common')

  const { data, isLoading, isError } = useFeaturedCoachesAdmin()
  const createFeaturedCoach = useCreateFeaturedCoach()
  const updateFeaturedCoach = useUpdateFeaturedCoach()
  const deleteFeaturedCoach = useDeleteFeaturedCoach()

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<FeaturedCoach | null>(null)
  const [deleting, setDeleting] = useState<FeaturedCoach | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)

  const resetAdd = () => { setForm(emptyForm); setShowAdd(false) }
  const resetEdit = () => { setForm(emptyForm); setEditing(null) }

  const handleAdd = () => {
    createFeaturedCoach.mutate(
      {
        coach_id: Number(form.coach_id),
        position: Number(form.position),
        starts_at: form.starts_at,
        ends_at: form.ends_at || null,
        reason: form.reason || null,
      },
      { onSuccess: resetAdd }
    )
  }

  const handleEdit = (fc: FeaturedCoach) => {
    setForm({
      coach_id: String(fc.coach_id),
      position: String(fc.position),
      starts_at: fc.starts_at.slice(0, 16),
      ends_at: fc.ends_at ? fc.ends_at.slice(0, 16) : '',
      reason: fc.reason ?? '',
    })
    setEditing(fc)
  }

  const handleUpdate = () => {
    if (!editing) return
    updateFeaturedCoach.mutate(
      {
        id: editing.id,
        position: Number(form.position),
        starts_at: form.starts_at,
        ends_at: form.ends_at || null,
        reason: form.reason || null,
      },
      { onSuccess: resetEdit }
    )
  }

  const handleDelete = () => {
    if (!deleting) return
    deleteFeaturedCoach.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
      </div>
    )
  }

  if (isError) {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  const featuredCoaches = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-zinc-100">{t('title')}</h1>
        <Button className="gap-1.5" onClick={() => { resetAdd(); setShowAdd(true) }}>
          <Plus className="h-4 w-4" /> {t('addButton')}
        </Button>
      </div>

      {featuredCoaches.length === 0 ? (
        <EmptyState icon={Star} title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <div className="space-y-3">
          {featuredCoaches.map((fc) => (
            <div key={fc.id} className="card flex items-center gap-4 p-4">
              <Avatar
                src={fc.coach?.avatar_path}
                name={fc.coach?.display_name ?? '?'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-100 truncate">
                    {fc.coach?.display_name ?? `Coach #${fc.coach_id}`}
                  </span>
                  <span className="text-xs text-zinc-500">#{fc.position}</span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {formatDate(fc.starts_at)}
                  {fc.ends_at ? ` — ${formatDate(fc.ends_at)}` : ' · indefinite'}
                  {fc.reason ? ` · ${fc.reason}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => handleEdit(fc)}>
                  <Pencil className="h-3.5 w-3.5" /> {tc('edit')}
                </Button>
                <Button size="sm" variant="danger" className="gap-1.5" onClick={() => setDeleting(fc)}>
                  <Trash2 className="h-3.5 w-3.5" /> {tc('delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onOpenChange={(o) => !o && resetAdd()} title={t('addTitle')}>
        <div className="space-y-4">
          <Input
            label={t('coachIdLabel')}
            placeholder={t('coachIdPlaceholder')}
            value={form.coach_id}
            onChange={(e) => setForm({ ...form, coach_id: e.target.value })}
            required
            type="number"
          />
          <Input
            label={t('positionLabel')}
            placeholder="1"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            required
            type="number"
          />
          <Input
            label={t('startsAtLabel')}
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            required
            type="datetime-local"
          />
          <Input
            label={t('endsAtLabel')}
            value={form.ends_at}
            onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            type="datetime-local"
          />
          <Input
            label={t('reasonLabel')}
            placeholder={t('reasonPlaceholder')}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={resetAdd}>{tc('cancel')}</Button>
            <Button
              onClick={handleAdd}
              disabled={!form.coach_id || !form.position || !form.starts_at}
              isLoading={createFeaturedCoach.isPending}
            >
              {tc('save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onOpenChange={(o) => !o && resetEdit()} title={t('editTitle')}>
        <div className="space-y-4">
          <Input
            label={t('positionLabel')}
            placeholder="1"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            required
            type="number"
          />
          <Input
            label={t('startsAtLabel')}
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            required
            type="datetime-local"
          />
          <Input
            label={t('endsAtLabel')}
            value={form.ends_at}
            onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            type="datetime-local"
          />
          <Input
            label={t('reasonLabel')}
            placeholder={t('reasonPlaceholder')}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={resetEdit}>{tc('cancel')}</Button>
            <Button
              onClick={handleUpdate}
              disabled={!form.position || !form.starts_at}
              isLoading={updateFeaturedCoach.isPending}
            >
              {tc('save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title={t('deleteTitle')}>
        <p className="text-sm text-zinc-400">
          {t('deleteConfirm', { name: deleting?.coach?.display_name ?? `Coach #${deleting?.coach_id}` })}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleting(null)}>{tc('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleteFeaturedCoach.isPending}>
            {tc('delete')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
