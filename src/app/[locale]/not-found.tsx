import { getTranslations } from 'next-intl/server'
import { Compass, House } from 'lucide-react'
import { Link } from '@/navigation'
import { Logo } from '@/components/layout/Logo'

export default async function NotFoundPage() {
  const t = await getTranslations('common')
  const tMarketplace = await getTranslations('marketplace')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center">
      <div className="w-full max-w-md">
        <Logo className="mb-10 justify-center" />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-navy-800">
          <Compass className="h-7 w-7 text-green-400" aria-hidden="true" />
        </div>

        <h1 className="font-display text-2xl font-bold text-zinc-50">{t('notFound')}</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{t('notFoundDesc')}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary flex-1">
            <House className="h-4 w-4" aria-hidden="true" />
            {t('goHome')}
          </Link>
          <Link href="/marketplace" className="btn-secondary flex-1">
            <Compass className="h-4 w-4" aria-hidden="true" />
            {tMarketplace('browseCoaches')}
          </Link>
        </div>
      </div>
    </div>
  )
}
