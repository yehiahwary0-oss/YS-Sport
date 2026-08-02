'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Wifi, WifiOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useConversationDetail, useSendMessage } from '@/hooks/useConversation'
import { usePusherConversation, usePusherConnectionState } from '@/hooks/usePusherChannel'
import { useAuthStore } from '@/store/auth.store'
import { timeAgo, cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'

export function ChatPanel({ conversationUuid }: { conversationUuid: string | undefined }) {
  const t = useTranslations('chat')
  const user = useAuthStore((s) => s.user)

  // Real-time updates via WebSocket when configured;
  // react-query's refetchInterval below acts as a safety-net fallback
  // (slowed down since Pusher is now the primary delivery mechanism).
  usePusherConversation(conversationUuid)
  const connectionState = usePusherConnectionState()
  const isPusherConfigured = !!process.env.NEXT_PUBLIC_PUSHER_KEY

  const { data, isLoading } = useConversationDetail(conversationUuid)
  const sendMessage = useSendMessage()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.messages.data.length])

  const handleSend = () => {
    if (!text.trim() || !conversationUuid) return
    sendMessage.mutate({ uuid: conversationUuid, body: text.trim() })
    setText('')
  }

  if (!conversationUuid) {
    return (
      <div className="card flex h-80 items-center justify-center p-6">
        <p className="text-sm text-zinc-500">Chat will be available once the booking is confirmed.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="card flex h-80 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="card flex h-96 flex-col">
      <div className="flex items-center justify-end gap-1.5 border-b border-zinc-800 px-4 py-2">
        {isPusherConfigured && connectionState === 'connected' ? (
          <span className="flex items-center gap-1 text-2xs text-green-400">
            <Wifi className="h-3 w-3" /> {t('connection.live')}
          </span>
        ) : isPusherConfigured &&
          (connectionState === 'connecting' || connectionState === 'initialized') ? (
          <span className="flex items-center gap-1 text-2xs text-yellow-400">
            <Wifi className="h-3 w-3" /> {t('connection.connecting')}
          </span>
        ) : isPusherConfigured ? (
          <span className="flex items-center gap-1 text-2xs text-red-400">
            <WifiOff className="h-3 w-3" /> {t('connection.offline')}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-2xs text-zinc-500">
            <WifiOff className="h-3 w-3" /> {t('connection.polling')}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {data?.messages.data.map((msg) => {
          const isMine = msg.sender?.uuid === user?.uuid
          return (
            <div key={msg.uuid} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                  msg.is_system
                    ? 'mx-auto bg-navy-700 text-zinc-400 text-xs italic'
                    : isMine
                    ? 'bg-green-500 text-navy-900'
                    : 'bg-navy-700 text-zinc-200'
                )}
              >
                {msg.body}
                <div className={cn('mt-1 text-2xs', isMine ? 'text-navy-900/60' : 'text-zinc-500')}>
                  {timeAgo(msg.created_at)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-800 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('inputPlaceholder')}
          className="flex-1 rounded-lg bg-navy-700 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-green-500/50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMessage.isPending}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 text-navy-900 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
