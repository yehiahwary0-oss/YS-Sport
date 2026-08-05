'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { DAY_KEYS, INTENSITY_KEYS, SESSION_TYPE_KEYS } from '@/lib/training-plan-dicts'
import { cn } from '@/lib/utils'
import type { TrainingPlanWeek } from '@/types'

export function WeekAccordion({ week, defaultOpen = false }: { week: TrainingPlanWeek; defaultOpen?: boolean }) {
  const t = useTranslations()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-xl border border-navy-700/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 bg-navy-800/40 px-4 py-3 text-left transition-colors hover:bg-navy-800"
      >
        <div>
          <p className="text-sm font-semibold text-zinc-100">
            {t('trainingPlans.week', { week: week.week })}
            {week.focus ? (
              <span className="ml-2 text-xs font-normal text-zinc-500">· {week.focus}</span>
            ) : null}
          </p>
          <p className="mt-0.5 text-2xs text-zinc-500">
            {t('trainingPlans.sessionsCount', { count: week.sessions.length })}
          </p>
        </div>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <ul className="divide-y divide-navy-800">
          {week.sessions.map((session, i) => {
            const typeKey = SESSION_TYPE_KEYS[session.type]
            const intensityKey = INTENSITY_KEYS[session.intensity]
            const dayKey = DAY_KEYS[session.day]
            return (
              <li key={`${week.week}-${i}`} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs font-medium text-green-400">
                    {dayKey ? t(dayKey) : session.day}
                  </span>
                  <span className="text-sm text-zinc-200">
                    {typeKey ? t(typeKey) : session.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-2xs">
                  <span className="text-zinc-500">{session.duration}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 font-medium',
                      session.intensity === 'Very High' && 'bg-red-500/10 text-red-400',
                      session.intensity === 'High' && 'bg-amber-500/10 text-amber-400',
                      session.intensity === 'Moderate' && 'bg-green-500/10 text-green-400',
                      session.intensity === 'Low' && 'bg-zinc-700/40 text-zinc-400',
                    )}
                  >
                    {intensityKey ? t(intensityKey) : session.intensity}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
