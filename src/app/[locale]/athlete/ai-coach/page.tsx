'use client'

import { useTranslations } from 'next-intl'
import { AiCoachChat } from '@/components/athlete/AiCoachChat'

export default function AthleteAiCoachPage() {
  const t = useTranslations('aiCoach')

  return (
    <div className="space-y-6">
      <section aria-labelledby="ai-coach-heading">
        <h1 id="ai-coach-heading" className="sr-only">
          {t('title')}
        </h1>
        <AiCoachChat />
      </section>
    </div>
  )
}
