import { api } from '@/lib/api'
import type { AvailabilitySlot, PaginatedResponse } from '@/types'

export const availabilityService = {

  async list(from?: string, to?: string): Promise<PaginatedResponse<AvailabilitySlot>> {
    const { data } = await api.get('/coach/availability', { params: { from, to } })
    return data as PaginatedResponse<AvailabilitySlot>
  },

  async create(payload: {
    starts_at: string
    ends_at: string
    timezone: string
  }): Promise<AvailabilitySlot> {
    const { data } = await api.post('/coach/availability', payload)
    return data.data as AvailabilitySlot
  },

  async bulkCreate(slots: Array<{
    starts_at: string
    ends_at: string
    timezone: string
  }>): Promise<{ data: AvailabilitySlot[]; count: number }> {
    const { data } = await api.post('/coach/availability/bulk', { slots })
    return data as { data: AvailabilitySlot[]; count: number }
  },

  async remove(uuid: string): Promise<void> {
    await api.delete(`/coach/availability/${uuid}`)
  },
}
