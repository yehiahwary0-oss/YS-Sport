import { api } from '@/lib/api'
import type { Booking, PaginatedResponse } from '@/types'

export const bookingService = {

  // Athlete
  async listAthlete(status?: string, page = 1): Promise<PaginatedResponse<Booking>> {
    const { data } = await api.get('/athlete/bookings', { params: { status, page } })
    return data as PaginatedResponse<Booking>
  },

  async getAthlete(uuid: string): Promise<Booking> {
    const { data } = await api.get(`/athlete/bookings/${uuid}`)
    return data.data as Booking
  },

  async cancelAthlete(uuid: string, reason?: string): Promise<Booking> {
    const params: Record<string, string> = {}
    if (reason) params.reason = reason
    const { data } = await api.delete(`/athlete/bookings/${uuid}/cancel`, { params })
    return data.data as Booking
  },

  // Coach
  async listCoach(status?: string, page = 1): Promise<PaginatedResponse<Booking>> {
    const { data } = await api.get('/coach/bookings', { params: { status, page } })
    return data as PaginatedResponse<Booking>
  },

  async getCoach(uuid: string): Promise<Booking> {
    const { data } = await api.get(`/coach/bookings/${uuid}`)
    return data.data as Booking
  },

  async complete(uuid: string, sessionNotes?: string): Promise<Booking> {
    const { data } = await api.put(`/coach/bookings/${uuid}/complete`, { session_notes: sessionNotes })
    return data.data as Booking
  },

  async markNoShow(uuid: string): Promise<Booking> {
    const { data } = await api.put(`/coach/bookings/${uuid}/no-show`)
    return data.data as Booking
  },

  async cancelCoach(uuid: string, reason?: string): Promise<Booking> {
    const { data } = await api.put(`/coach/bookings/${uuid}/cancel`, { reason })
    return data.data as Booking
  },

  async setSessionLink(uuid: string, link: string): Promise<Booking> {
    const { data } = await api.put(`/coach/bookings/${uuid}/session-link`, { link })
    return data.data as Booking
  },

  async assignSlot(uuid: string, slotUuid: string): Promise<Booking> {
    const { data } = await api.put(`/coach/bookings/${uuid}/assign-slot`, { slot_uuid: slotUuid })
    return data.data as Booking
  },
}
