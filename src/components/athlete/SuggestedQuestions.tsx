'use client'

import { useTranslations } from 'next-intl'

export function SuggestedQuestions({ questions, onSelect }: { questions: string[]; onSelect: (q: string) => void }) {
  const t = useTranslations('aiCoach')

  if (!questions.length) return null

  return (
    <div className="flex flex-wrap gap-2 px-1">
      <span className="flex items-center text-2xs text-zinc-500">{t('suggestedLabel')}</span>
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300 transition-colors hover:bg-violet-500/20"
        >
          {question}
        </button>
      ))}
    </div>
  )
}
