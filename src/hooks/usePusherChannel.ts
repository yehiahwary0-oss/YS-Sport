import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getPusherClient } from '@/lib/pusher'
import type { Message } from '@/types'

/**
 * Subscribes to private-conversation.{uuid} and pushes new messages
 * directly into the React Query cache — no polling needed once this
 * is active. Falls back gracefully if Pusher key isn't configured.
 */
export function usePusherConversation(conversationUuid: string | undefined) {
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<ReturnType<typeof getPusherClient>['subscribe']> | null>(null)

  useEffect(() => {
    if (!conversationUuid || !process.env.NEXT_PUBLIC_PUSHER_KEY) return

    const pusher = getPusherClient()
    const channelName = `private-conversation.${conversationUuid}`
    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    channel.bind('MessageSent', (data: { message: Message }) => {
      queryClient.setQueryData(
        ['conversations', conversationUuid],
        (old: { conversation: unknown; messages: { data: Message[] } } | undefined) => {
          if (!old) return old
          // Avoid duplicate insert if optimistic update already added it
          const exists = old.messages.data.some((m) => m.uuid === data.message.uuid)
          if (exists) return old
          return {
            ...old,
            messages: { ...old.messages, data: [...old.messages.data, data.message] },
          }
        }
      )
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    return () => {
      pusher.unsubscribe(channelName)
      channelRef.current = null
    }
  }, [conversationUuid, queryClient])
}
