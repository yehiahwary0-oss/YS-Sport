'use client'

import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AiChatMessage } from '@/types'

export function ChatMessageBubble({ message }: { message: AiChatMessage }) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={cn('flex items-end gap-2', isAssistant ? 'justify-start' : 'justify-end')}>
      {isAssistant ? (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
          <Bot className="h-4 w-4" />
        </span>
      ) : null}
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
          isAssistant
            ? 'rounded-bl-sm border border-violet-500/20 bg-navy-800 text-zinc-100'
            : 'rounded-br-sm bg-green-500 text-navy-900',
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={cn('mt-1 text-2xs', isAssistant ? 'text-zinc-500' : 'text-navy-900/60')}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
