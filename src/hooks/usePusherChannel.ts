import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getPusherClient } from '@/lib/pusher'
import type { Message } from '@/types'

/**
 * FLAT payload broadcast by the backend (MessageSent event) — the
 * frontend reads these keys directly; there is no nested `message`.
 */
export interface MessageSentPayload {
  uuid: string
  conversation_id: string
  sender_id: string | null
  sender_uuid: string | null
  sender_name: string | null
  sender_avatar: string | null
  body: string
  is_system: boolean
  read_at: string | null
  created_at: string
}

export type PusherConnectionState =
  | 'initialized'
  | 'connecting'
  | 'connected'
  | 'unavailable'
  | 'failed'
  | 'disconnected'

export function pusherMessageToMessage(payload: MessageSentPayload): Message {
  return {
    uuid: payload.uuid,
    conversation_id: payload.conversation_id,
    sender_id: payload.sender_uuid ?? payload.sender_id,
    body: payload.body,
    is_system: payload.is_system,
    read_at: payload.read_at,
    created_at: payload.created_at,
    sender: payload.sender_uuid
      ? {
          uuid: payload.sender_uuid,
          name: payload.sender_name,
          avatar: payload.sender_avatar,
        }
      : undefined,
  }
}

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

    channel.bind('MessageSent', (payload: MessageSentPayload) => {
      const message = pusherMessageToMessage(payload)
      queryClient.setQueryData(
        ['conversations', conversationUuid],
        (old: { conversation: unknown; messages: { data: Message[] } } | undefined) => {
          if (!old) return old
          // Avoid duplicate insert if optimistic update already added it
          const exists = old.messages.data.some((m) => m.uuid === message.uuid)
          if (exists) return old
          return {
            ...old,
            messages: { ...old.messages, data: [...old.messages.data, message] },
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

/**
 * Tracks the real Pusher connection state so UI can show
 * Connecting / Live / Offline instead of guessing from the
 * presence of an env key at build time.
 */
export function usePusherConnectionState(): PusherConnectionState {
  const [state, setState] = useState<PusherConnectionState>('initialized')

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return

    const pusher = getPusherClient()
    setState(pusher.connection.state as PusherConnectionState)

    const onChange = (change: { current: PusherConnectionState }) => setState(change.current)
    pusher.connection.bind('state_change', onChange)

    return () => {
      pusher.connection.unbind('state_change', onChange)
    }
  }, [])

  return state
}
