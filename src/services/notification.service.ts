import { api } from '@/lib/api'
import type { AppNotification, PaginatedResponse } from '@/types'

export interface NotificationFilterParams {
  page?: number
  type?: string[]
  read?: boolean
}

export const notificationService = {

  async list(params?: NotificationFilterParams): Promise<PaginatedResponse<AppNotification>> {
    const { data } = await api.get('/notifications', { params })
    return data as PaginatedResponse<AppNotification>
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get('/notifications/unread-count')
    return data.data.count as number
  },

  async markRead(uuid: string): Promise<void> {
    await api.put(`/notifications/${uuid}/read`)
  },

  async markAllRead(): Promise<void> {
    await api.put('/notifications/read-all')
  },
}
