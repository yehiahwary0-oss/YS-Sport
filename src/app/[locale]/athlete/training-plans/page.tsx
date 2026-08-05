'use client'

import { useTranslations } from 'next-intl'
import { TrainingPlanGenerator } from '@/components/athlete/TrainingPlanGenerator'

export default function AthleteTrainingPlansPage() {
  const t = useTranslations('trainingPlans')

  return (
    <div className="space-y-6">
      <section aria-labelledby="training-plans-heading">
        <h1 id="training-plans-heading" className="sr-only">
          {t('title')}
        </h1>
        <TrainingPlanGenerator />
      </section>
    </div>
  )
}
