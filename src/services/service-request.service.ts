import { api } from '@/lib/api'
import { toPaginated } from '@/lib/pagination'
import type { ServiceRequest, PaginatedResponse } from '@/types'

export const serviceRequestService = {

  // Athlete
  async create(payload: {
    coach_uuid: string
    package_uuid: string
    message?: string
  }): Promise<ServiceRequest> {
    const { data } = await api.post('/service-requests', payload)
    return data.data as ServiceRequest
  },

  async listAthlete(status?: string, page = 1): Promise<PaginatedResponse<ServiceRequest>> {
    const { data } = await api.get('/athlete/service-requests', { params: { status, page } })
    return toPaginated<ServiceRequest>(data.data)
  },

  async getAthlete(uuid: string): Promise<ServiceRequest> {
    const { data } = await api.get(`/athlete/service-requests/${uuid}`)
    return data.data as ServiceRequest
  },

  async cancel(uuid: string): Promise<ServiceRequest> {
    const { data } = await api.delete(`/athlete/service-requests/${uuid}/cancel`)
    return data.data as ServiceRequest
  },

  // Coach
  async listCoach(status?: string, page = 1): Promise<PaginatedResponse<ServiceRequest>> {
    const { data } = await api.get('/coach/service-requests', { params: { status, page } })
    return toPaginated<ServiceRequest>(data.data)
  },

  async getCoach(uuid: string): Promise<ServiceRequest> {
    const { data } = await api.get(`/coach/service-requests/${uuid}`)
    return data.data as ServiceRequest
  },

  async accept(uuid: string): Promise<ServiceRequest> {
    const { data } = await api.put(`/coach/service-requests/${uuid}/accept`)
    return data.data as ServiceRequest
  },

  async reject(uuid: string, reason?: string): Promise<ServiceRequest> {
    const { data } = await api.put(`/coach/service-requests/${uuid}/reject`, { reason })
    return data.data as ServiceRequest
  },
}
