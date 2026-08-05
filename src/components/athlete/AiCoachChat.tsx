'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, Send, Sparkles } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { ChatMessageBubble } from '@/components/athlete/ChatMessageBubble'
import { SuggestedQuestions } from '@/components/athlete/SuggestedQuestions'
import { TypingIndicator } from '@/components/athlete/TypingIndicator'
import { useAiChat } from '@/hooks/useAiCoach'
import { cn } from '@/lib/utils'
import type { AiChatMessage } from '@/types'

interface LocalMessage extends AiChatMessage {
  temp?: boolean
}

const EMPTY_QUESTIONS = ['How do I find a coach?', 'How do I book a session?', 'How can I improve my level?']

export function AiCoachChat({ history }: { history?: LocalMessage[] }) {
  const t = useTranslations('aiCoach')
  const locale = useLocale()
  const chat = useAiChat()
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [text, setText] = useState('')
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [suggested, setSuggested] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (history && history.length > 0) {
      setMessages(history)
      setConversationId(undefined)
    }
  }, [history])

  useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, chat.isPending])

  const send = (raw?: string) => {
    const message = (raw ?? text).trim()
    if (!message || chat.isPending) return

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message, timestamp: new Date().toISOString(), temp: true },
    ])
    setText('')
    setSuggested([])

    chat.mutate(
      { message, conversationId, lang: locale === 'ar' ? 'ar' : 'en' },
      {
        onSuccess: (data) => {
          setConversationId(data.conversation_id)
          setMessages((prev) => {
            const withoutTemp = prev.filter((m) => !m.temp)
            return [
              ...withoutTemp,
              { role: 'user', content: message, timestamp: new Date().toISOString() },
              { role: 'assistant', content: data.reply, timestamp: new Date().toISOString() },
            ]
          })
          setSuggested(data.suggested_questions)
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: t('error'), timestamp: new Date().toISOString() },
          ])
        },
      },
    )
  }

  const showEmpty = messages.length === 0 && !chat.isPending

  return (
    <div className="card flex h-[600px] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-navy-800 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
          <Bot className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-100">{t('title')}</p>
          <p className="flex items-center gap-1.5 text-2xs text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {t('online')}
          </p>
        </div>
        <Sparkles className="h-4 w-4 text-violet-400" />
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {showEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
              <Bot className="h-7 w-7" />
            </span>
            <p className="text-sm font-medium text-zinc-300">{t('emptyTitle')}</p>
            <p className="max-w-xs text-2xs text-zinc-500">{t('emptyDesc')}</p>
          </div>
        ) : (
          messages.map((message, i) => <ChatMessageBubble key={`${message.timestamp}-${i}`} message={message} />)
        )}
        {chat.isPending ? <TypingIndicator /> : null}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      <div className={cn('px-4 pb-2', suggested.length === 0 && 'pt-2')}>
        <SuggestedQuestions questions={suggested} onSelect={send} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-navy-800 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={t('inputPlaceholder')}
          className="flex-1 rounded-lg border border-navy-700 bg-navy-800/60 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
        />
        <button
          onClick={() => send()}
          disabled={!text.trim() || chat.isPending}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500 text-white transition-colors hover:bg-violet-400 disabled:opacity-50"
          aria-label={t('sendButton')}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
