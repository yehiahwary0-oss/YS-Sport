'use client'

import { CalendarDays, Dumbbell } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { WeekAccordion } from '@/components/athlete/WeekAccordion'
import { GOAL_KEYS, LEVEL_KEYS } from '@/lib/training-plan-dicts'
import { cn } from '@/lib/utils'
import type { TrainingPlanTemplate } from '@/types'

const MATCH_BADGE: Record<string, string> = {
  exact: 'bg-green-500/15 text-green-400',
  close: 'bg-blue-500/15 text-blue-400',
  generic: 'bg-zinc-700/40 text-zinc-400',
}

export function TrainingPlanCard({ template }: { template: TrainingPlanTemplate }) {
  const t = useTranslations()
  const locale = useLocale()
  const title = template.title[locale === 'ar' ? 'ar' : 'en']
  const description = template.description[locale === 'ar' ? 'ar' : 'en']
  const levelKey = LEVEL_KEYS[template.level]
  const goalKey = GOAL_KEYS[template.goal]
  const sportName = template.sport?.name ?? t('trainingPlans.genericSport')

  return (
    <div className="card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-50">{title}</h2>
            {template.match_type ? (
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-2xs font-semibold',
                  MATCH_BADGE[template.match_type],
                )}
              >
                {t(`trainingPlans.matchTypes.${template.match_type}`)}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-zinc-500">
            {sportName}
            {levelKey ? ` · ${t(levelKey)}` : ''}
            {goalKey ? ` · ${t(goalKey)}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-navy-800/60 px-2.5 py-1.5 text-2xs text-zinc-300">
            <CalendarDays className="h-3.5 w-3.5 text-green-400" />
            {t('trainingPlans.duration', { weeks: template.duration_weeks })}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-navy-800/60 px-2.5 py-1.5 text-2xs text-zinc-300">
            <Dumbbell className="h-3.5 w-3.5 text-green-400" />
            {t('trainingPlans.perWeek', { count: template.sessions_per_week })}
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>

      <div className="space-y-2">
        {template.plan_structure.map((week, i) => (
          <WeekAccordion key={week.week} week={week} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  )
}
