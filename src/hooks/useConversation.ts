import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { conversationService } from '@/services/conversation.service'
import { getApiError } from '@/lib/api'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationService.list(),
    refetchInterval: 15_000,
  })
}

export function useFindBookingConversation(bookingUuid: string | undefined) {
  return useQuery({
    queryKey: ['conversations', 'booking', bookingUuid],
    queryFn: () => conversationService.findByBookingUuid(bookingUuid!),
    enabled: !!bookingUuid,
  })
}

export function useConversationDetail(uuid: string | undefined) {
  return useQuery({
    queryKey: ['conversations', uuid],
    queryFn: () => conversationService.get(uuid!),
    enabled: !!uuid,
    // Safety-net only — Pusher delivers messages in real-time when configured.
    // Without a Pusher key this becomes the only delivery mechanism (5s polling).
    refetchInterval: process.env.NEXT_PUBLIC_PUSHER_KEY ? 30_000 : 5_000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, body }: { uuid: string; body: string }) => conversationService.sendMessage(uuid, body),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', uuid] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (err) => toast.error(getApiError(err)),
  })
}
