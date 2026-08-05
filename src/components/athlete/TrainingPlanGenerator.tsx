'use client'

import { useState } from 'react'
import { RefreshCw, Share2, Sparkles, BookmarkPlus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { TrainingPlanCard } from '@/components/athlete/TrainingPlanCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useSports } from '@/hooks/useMarketplace'
import { useTrainingTemplates } from '@/hooks/useTrainingPlans'
import { GOAL_KEYS, LEVEL_KEYS } from '@/lib/training-plan-dicts'
import { cn } from '@/lib/utils'
import type { TrainingLevel, TrainingPlanGoal } from '@/types'

const LEVELS: TrainingLevel[] = ['beginner', 'intermediate', 'advanced']
const GOALS: TrainingPlanGoal[] = ['fitness', 'competition', 'weight_loss', 'muscle_gain']

export function TrainingPlanGenerator() {
  const t = useTranslations()
  const locale = useLocale()
  const { data: sports, isLoading: sportsLoading } = useSports()

  const [sportId, setSportId] = useState<number | null>(null)
  const [level, setLevel] = useState<TrainingLevel | null>(null)
  const [goal, setGoal] = useState<TrainingPlanGoal | null>(null)
  const [pickedIndex, setPickedIndex] = useState(0)

  const ready = sportId !== null && level !== null && goal !== null

  const { data: templates, isLoading, isError, refetch } = useTrainingTemplates(
    { sport_id: sportId ?? undefined, level: level ?? undefined, goal: goal ?? undefined, limit: 5 },
    ready,
  )

  const matches = templates ?? []
  const selected = matches[pickedIndex] ?? matches[0] ?? null

  const startOver = () => {
    setSportId(null)
    setLevel(null)
    setGoal(null)
    setPickedIndex(0)
  }

  const regenerate = () => {
    setPickedIndex((i) => (i + 1) % Math.max(1, matches.length))
  }

  const onComingSoon = () => {
    toast(t('trainingPlans.comingSoon'))
  }

  if (sportsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-100">{t('trainingPlans.generatorTitle')}</h2>
          <Sparkles className="h-4 w-4 text-green-400" />
        </div>

        {/* Step 1 — Sport */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t('trainingPlans.step', { step: 1 })} · {t('trainingPlans.sportLabel')}
          </p>
          <div className="flex flex-wrap gap-2">
            {(sports ?? []).slice(0, 12).map((sport) => (
              <button
                key={sport.id}
                type="button"
                onClick={() => {
                  setSportId(sport.id)
                  setPickedIndex(0)
                }}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  sportId === sport.id
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-navy-700 bg-navy-800/40 text-zinc-300 hover:border-navy-600',
                )}
              >
                {sport.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Level */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t('trainingPlans.step', { step: 2 })} · {t('trainingPlans.levelLabel')}
          </p>
          <div className="flex gap-2">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setLevel(lvl)
                  setPickedIndex(0)
                }}
                className={cn(
                  'flex-1 rounded-lg border px-3 py-2 text-sm transition-colors sm:flex-none sm:px-5',
                  level === lvl
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-navy-700 bg-navy-800/40 text-zinc-300 hover:border-navy-600',
                )}
              >
                {t(LEVEL_KEYS[lvl])}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3 — Goal */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t('trainingPlans.step', { step: 3 })} · {t('trainingPlans.goalLabel')}
          </p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGoal(g)
                  setPickedIndex(0)
                }}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  goal === g
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-navy-700 bg-navy-800/40 text-zinc-300 hover:border-navy-600',
                )}
              >
                {t(GOAL_KEYS[g])}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Step 4 — Result */}
      {ready ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner />
            </div>
          ) : isError ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-zinc-400">{t('trainingPlans.error')}</p>
              <Button variant="secondary" onClick={() => refetch()} className="mt-3">
                {t('common.retry')}
              </Button>
            </Card>
          ) : selected ? (
            <>
              <TrainingPlanCard template={selected} />

              {matches.length > 1 ? (
                <p className="text-center text-xs text-zinc-500">
                  {t('trainingPlans.alternatives', { count: matches.length })}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={regenerate} disabled={matches.length <= 1}>
                  <RefreshCw className="h-4 w-4" />
                  {t('trainingPlans.regenerate')}
                </Button>
                <Button variant="secondary" onClick={onComingSoon}>
                  <BookmarkPlus className="h-4 w-4" />
                  {t('trainingPlans.saveToMyPlans')}
                </Button>
                <Button variant="secondary" onClick={onComingSoon}>
                  <Share2 className="h-4 w-4" />
                  {t('trainingPlans.shareWithCoach')}
                </Button>
                <Button variant="ghost" onClick={startOver}>
                  {t('trainingPlans.startOver')}
                </Button>
              </div>
            </>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-sm text-zinc-400">
                {t('trainingPlans.noTemplate')}
                {locale === 'ar' ? '' : ''}
              </p>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  )
}
