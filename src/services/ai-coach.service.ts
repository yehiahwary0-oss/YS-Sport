import { api } from '@/lib/api'
import type { AiChatResponse, AiConversation } from '@/types'

export const aiCoachService = {
  async chat(message: string, conversationId?: string, lang: 'en' | 'ar' = 'en'): Promise<AiChatResponse> {
    const { data } = await api.post('/athlete/ai-coach/chat', {
      message,
      conversation_id: conversationId,
      lang,
    })
    return data as AiChatResponse
  },

  async listConversations(): Promise<AiConversation[]> {
    const { data } = await api.get('/athlete/ai-coach/conversations')
    return data.data as AiConversation[]
  },

  async getConversation(uuid: string): Promise<AiConversation> {
    const { data } = await api.get(`/athlete/ai-coach/conversations/${uuid}`)
    return data.data as AiConversation
  },
}
