'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  usePromoCodesAdmin,
  useCreatePromoCode,
  useUpdatePromoCode,
  useTogglePromoCodeStatus,
  useDeletePromoCode,
} from '@/hooks/useAdmin'
import { formatDate } from '@/lib/utils'
import type { PromoCode, PromoCodeFormData, DiscountType } from '@/types'

const emptyForm: PromoCodeFormData = {
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  min_order_amount: null,
  max_discount_amount: null,
  max_uses: null,
  max_uses_per_user: 1,
  starts_at: null,
  expires_at: null,
  is_active: true,
  description: null,
}

export default function AdminPromoCodesPage() {
  const t = useTranslations('admin.promoCodes')
  const tc = useTranslations('common')

  const { data, isLoading, isError } = usePromoCodesAdmin()
  const createPromoCode = useCreatePromoCode()
  const updatePromoCode = useUpdatePromoCode()
  const togglePromoCodeStatus = useTogglePromoCodeStatus()
  const deletePromoCode = useDeletePromoCode()

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<PromoCode | null>(null)
  const [deleting, setDeleting] = useState<PromoCode | null>(null)
  const [form, setForm] = useState<PromoCodeFormData>(emptyForm)

  const resetAdd = () => { setForm(emptyForm); setShowAdd(false) }
  const resetEdit = () => { setForm(emptyForm); setEditing(null) }

  const handleAdd = () => {
    createPromoCode.mutate(form, { onSuccess: resetAdd })
  }

  const handleEdit = (pc: PromoCode) => {
    setForm({
      code: pc.code,
      discount_type: pc.discount_type,
      discount_value: Number(pc.discount_value),
      min_order_amount: pc.min_order_amount ? Number(pc.min_order_amount) : null,
      max_discount_amount: pc.max_discount_amount ? Number(pc.max_discount_amount) : null,
      max_uses: pc.max_uses,
      max_uses_per_user: pc.max_uses_per_user,
      starts_at: pc.starts_at ? pc.starts_at.slice(0, 16) : null,
      expires_at: pc.expires_at ? pc.expires_at.slice(0, 16) : null,
      is_active: pc.is_active,
      description: pc.description,
    })
    setEditing(pc)
  }

  const handleUpdate = () => {
    if (!editing) return
    updatePromoCode.mutate({ id: editing.id, ...form }, { onSuccess: resetEdit })
  }

  const handleDelete = () => {
    if (!deleting) return
    deletePromoCode.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
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

  const promoCodes = data ?? []

  const discountLabel = (pc: PromoCode) =>
    pc.discount_type === 'percentage' ? `${pc.discount_value}%` : `${pc.discount_value}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-zinc-100">{t('title')}</h1>
        <Button className="gap-1.5" onClick={() => { resetAdd(); setShowAdd(true) }}>
          <Plus className="h-4 w-4" /> {t('addButton')}
        </Button>
      </div>

      {promoCodes.length === 0 ? (
        <EmptyState icon={Tag} title={t('emptyTitle')} description={t('emptyDesc')} />
      ) : (
        <div className="space-y-3">
          {promoCodes.map((pc) => (
            <div key={pc.id} className="card flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-100">{pc.code}</span>
                  <span className="text-xs text-zinc-500">{discountLabel(pc)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${pc.is_active ? 'bg-green-900/40 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {pc.is_active ? t('active') : t('inactive')}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {pc.description ?? '—'} &middot; {pc.used_count}/{pc.max_uses ?? '∞'} {t('uses')}
                  {pc.expires_at ? ` · ${t('expires')} ${formatDate(pc.expires_at)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => togglePromoCodeStatus.mutate(pc.id)}>
                  {pc.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => handleEdit(pc)}>
                  <Pencil className="h-3.5 w-3.5" /> {tc('edit')}
                </Button>
                <Button size="sm" variant="danger" className="gap-1.5" onClick={() => setDeleting(pc)}>
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
            label={t('codeLabel')}
            placeholder="SUMMER2026"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">{t('discountTypeLabel')}</label>
              <select
                className="input w-full"
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as DiscountType })}
              >
                <option value="percentage">{t('percentage')}</option>
                <option value="fixed">{t('fixed')}</option>
              </select>
            </div>
            <Input
              label={t('discountValueLabel')}
              type="number"
              min="0.01"
              step="0.01"
              value={form.discount_value || ''}
              onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
              required
            />
          </div>
          <Input
            label={t('descriptionLabel')}
            placeholder={t('descriptionPlaceholder')}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value || null })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('maxUsesLabel')}
              type="number"
              min="1"
              placeholder={t('unlimited')}
              value={form.max_uses ?? ''}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label={t('maxUsesPerUserLabel')}
              type="number"
              min="1"
              value={form.max_uses_per_user}
              onChange={(e) => setForm({ ...form, max_uses_per_user: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('minOrderLabel')}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.min_order_amount ?? ''}
              onChange={(e) => setForm({ ...form, min_order_amount: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label={t('maxDiscountLabel')}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.max_discount_amount ?? ''}
              onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('startsAtLabel')}
              type="datetime-local"
              value={form.starts_at ?? ''}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value || null })}
            />
            <Input
              label={t('expiresAtLabel')}
              type="datetime-local"
              value={form.expires_at ?? ''}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value || null })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={resetAdd}>{tc('cancel')}</Button>
            <Button
              onClick={handleAdd}
              disabled={!form.code || !form.discount_value}
              isLoading={createPromoCode.isPending}
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
            label={t('codeLabel')}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">{t('discountTypeLabel')}</label>
              <select
                className="input w-full"
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value as DiscountType })}
              >
                <option value="percentage">{t('percentage')}</option>
                <option value="fixed">{t('fixed')}</option>
              </select>
            </div>
            <Input
              label={t('discountValueLabel')}
              type="number"
              min="0.01"
              step="0.01"
              value={form.discount_value || ''}
              onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
              required
            />
          </div>
          <Input
            label={t('descriptionLabel')}
            placeholder={t('descriptionPlaceholder')}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value || null })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('maxUsesLabel')}
              type="number"
              min="1"
              placeholder={t('unlimited')}
              value={form.max_uses ?? ''}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label={t('maxUsesPerUserLabel')}
              type="number"
              min="1"
              value={form.max_uses_per_user}
              onChange={(e) => setForm({ ...form, max_uses_per_user: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('minOrderLabel')}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.min_order_amount ?? ''}
              onChange={(e) => setForm({ ...form, min_order_amount: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              label={t('maxDiscountLabel')}
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.max_discount_amount ?? ''}
              onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('startsAtLabel')}
              type="datetime-local"
              value={form.starts_at ?? ''}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value || null })}
            />
            <Input
              label={t('expiresAtLabel')}
              type="datetime-local"
              value={form.expires_at ?? ''}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value || null })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={resetEdit}>{tc('cancel')}</Button>
            <Button
              onClick={handleUpdate}
              disabled={!form.code || !form.discount_value}
              isLoading={updatePromoCode.isPending}
            >
              {tc('save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title={t('deleteTitle')}>
        <p className="text-sm text-zinc-400">
          {t('deleteConfirm', { code: deleting?.code ?? '' })}
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleting(null)}>{tc('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deletePromoCode.isPending}>
            {tc('delete')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
