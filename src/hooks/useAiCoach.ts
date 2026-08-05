import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiCoachService } from '@/services/ai-coach.service'
import type { AiConversation } from '@/types'

export function useAiConversations() {
  return useQuery({
    queryKey: ['ai-coach', 'conversations'],
    queryFn: aiCoachService.listConversations,
    staleTime: 30_000,
  })
}

export function useAiConversation(uuid: string | undefined) {
  return useQuery({
    queryKey: ['ai-coach', 'conversations', uuid],
    queryFn: () => aiCoachService.getConversation(uuid!),
    enabled: !!uuid,
    staleTime: 30_000,
  })
}

export function useAiChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      message,
      conversationId,
      lang,
    }: {
      message: string
      conversationId?: string
      lang?: 'en' | 'ar'
    }) => aiCoachService.chat(message, conversationId, lang),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-coach', 'conversations'] })
    },
  })
}
