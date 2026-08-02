'use client'

import { useTranslations } from 'next-intl'
import { History } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export function XpHistorySection() {
  const t = useTranslations('progression')

  return (
    <section aria-labelledby="xp-history-heading">
      <h2 id="xp-history-heading" className="mb-4 text-lg font-semibold text-zinc-100">
        {t('xp_history')}
      </h2>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-navy-800/20 px-6 py-10 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy-800">
          <History className="h-6 w-6 text-zinc-600" aria-hidden="true" />
        </div>
        <p className="max-w-sm text-sm text-zinc-400">{t('xp_history_desc')}</p>
        <Badge className="mt-3 border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
          {t('coming_soon')}
        </Badge>
      </div>
    </section>
  )
}
