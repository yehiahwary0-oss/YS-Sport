'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreatePackage, useUpdatePackage } from '@/hooks/usePackages'
import type { CoachPackage } from '@/types'
import type { PackagePayload } from '@/services/package.service'

interface PackageFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPackage?: CoachPackage | null
}

const defaultForm: PackagePayload = {
  name: '',
  description: '',
  tier_label: 'basic',
  session_count: 1,
  session_duration_minutes: 60,
  delivery_mode: 'online',
  price_amount: 50,
  price_currency: 'USD',
}

export function PackageFormModal({ open, onOpenChange, editingPackage }: PackageFormModalProps) {
  const [form, setForm] = useState<PackagePayload>(defaultForm)
  const createPackage = useCreatePackage()
  const updatePackage = useUpdatePackage()

  useEffect(() => {
    if (editingPackage) {
      setForm({
        name: editingPackage.name,
        description: editingPackage.description ?? '',
        tier_label: editingPackage.tier_label ?? 'basic',
        session_count: editingPackage.session_count,
        session_duration_minutes: editingPackage.session_duration_minutes,
        delivery_mode: editingPackage.delivery_mode,
        price_amount: Number(editingPackage.price_amount),
        price_currency: editingPackage.price_currency,
      })
    } else {
      setForm(defaultForm)
    }
  }, [editingPackage, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingPackage) {
      updatePackage.mutate({ uuid: editingPackage.uuid, payload: form }, { onSuccess: () => onOpenChange(false) })
    } else {
      createPackage.mutate(form, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isLoading = createPackage.isPending || updatePackage.isPending

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={editingPackage ? 'Edit package' : 'Create package'}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Package name"
          placeholder="e.g. 1-on-1 Strength Training"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <Textarea
          label="Description"
          placeholder="What's included in this package?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <Select
          label="Tier"
          value={form.tier_label}
          onChange={(e) => setForm({ ...form, tier_label: e.target.value as PackagePayload['tier_label'] })}
        >
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sessions"
            type="number"
            min={1}
            max={50}
            value={form.session_count}
            onChange={(e) => setForm({ ...form, session_count: Number(e.target.value) })}
          />
          <Input
            label="Duration (min)"
            type="number"
            min={15}
            step={15}
            value={form.session_duration_minutes}
            onChange={(e) => setForm({ ...form, session_duration_minutes: Number(e.target.value) })}
          />
        </div>

        <Select
          label="Delivery mode"
          value={form.delivery_mode}
          onChange={(e) => setForm({ ...form, delivery_mode: e.target.value as PackagePayload['delivery_mode'] })}
        >
          <option value="online">Online</option>
          <option value="in_person">In Person</option>
          <option value="both">Both</option>
        </Select>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Input
              label="Price"
              type="number"
              min={1}
              step={0.01}
              value={form.price_amount}
              onChange={(e) => setForm({ ...form, price_amount: Number(e.target.value) })}
            />
          </div>
          <Select
            label="Currency"
            value={form.price_currency}
            onChange={(e) => setForm({ ...form, price_currency: e.target.value })}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="AED">AED</option>
            <option value="EGP">EGP</option>
          </Select>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {editingPackage ? 'Save Changes' : 'Create Package'}
        </Button>
      </form>
    </Modal>
  )
}
