import { api } from '@/lib/api'
import type { Conversation, Message, PaginatedResponse } from '@/types'

export const conversationService = {

  async list(page = 1): Promise<PaginatedResponse<Conversation>> {
    const { data } = await api.get('/conversations', { params: { page } })
    return data as PaginatedResponse<Conversation>
  },

  async findByBookingUuid(bookingUuid: string): Promise<Conversation | undefined> {
    const { data } = await api.get('/conversations', { params: { booking_uuid: bookingUuid } })
    const list = data as PaginatedResponse<Conversation>
    return list.data[0]
  },

  async get(uuid: string): Promise<{ conversation: Conversation; messages: PaginatedResponse<Message> }> {
    const { data } = await api.get(`/conversations/${uuid}`)
    return data.data as { conversation: Conversation; messages: PaginatedResponse<Message> }
  },

  async sendMessage(uuid: string, body: string): Promise<Message> {
    const { data } = await api.post(`/conversations/${uuid}/messages`, { body })
    return data.data as Message
  },

  async markRead(uuid: string): Promise<void> {
    await api.put(`/conversations/${uuid}/read`)
  },
}
