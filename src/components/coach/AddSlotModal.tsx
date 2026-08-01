'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useCreateSlot } from '@/hooks/useAvailability'

const timezones = [
  'UTC', 'Africa/Cairo', 'Asia/Dubai', 'Asia/Riyadh', 'Europe/London',
  'Europe/Paris', 'America/New_York', 'America/Los_Angeles',
]

export function AddSlotModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createSlot = useCreateSlot()
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [duration, setDuration] = useState(60)
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return

    const startsAt = new Date(`${date}T${startTime}:00`)
    const endsAt = new Date(startsAt.getTime() + duration * 60_000)

    createSlot.mutate(
      {
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        timezone,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add availability slot">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Date"
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Select label="Duration" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </Select>
        </div>

        <Select label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
          {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
        </Select>

        <Button type="submit" className="w-full" isLoading={createSlot.isPending}>
          Add Slot
        </Button>
      </form>
    </Modal>
  )
}
