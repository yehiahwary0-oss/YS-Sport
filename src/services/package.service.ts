import { api } from '@/lib/api'
import type { CoachPackage } from '@/types'

export interface PackagePayload {
  name: string
  description?: string
  tier_label?: 'basic' | 'standard' | 'premium'
  session_count: number
  session_duration_minutes: number
  delivery_mode: 'online' | 'in_person' | 'both'
  price_amount: number
  price_currency: string
}

export const packageService = {

  async list(): Promise<CoachPackage[]> {
    const { data } = await api.get('/coach/packages')
    return data.data as CoachPackage[]
  },

  async create(payload: PackagePayload): Promise<CoachPackage> {
    const { data } = await api.post('/coach/packages', payload)
    return data.data as CoachPackage
  },

  async update(uuid: string, payload: Partial<PackagePayload>): Promise<CoachPackage> {
    const { data } = await api.put(`/coach/packages/${uuid}`, payload)
    return data.data as CoachPackage
  },

  async toggle(uuid: string): Promise<CoachPackage> {
    const { data } = await api.put(`/coach/packages/${uuid}/toggle`)
    return data.data as CoachPackage
  },

  async reorder(orderedUuids: string[]): Promise<void> {
    await api.put('/coach/packages/reorder', { order: orderedUuids })
  },

  async remove(uuid: string): Promise<void> {
    await api.delete(`/coach/packages/${uuid}`)
  },
}
