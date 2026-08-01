import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { ArrowRight, ShieldCheck, MessageCircle, Calendar } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  const t = useTranslations('home')
  const tn = useTranslations('nav')
  return (
    <div className="min-h-screen bg-navy-900">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            {t('badge')}
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-zinc-50 sm:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400 sm:text-lg">
            {t('heroSubtitle')}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/marketplace">
              <Button size="lg" className="gap-2">
                {tn('findCoaches')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="secondary" size="lg">
                {t('becomeCoach')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl font-bold text-zinc-50 sm:text-3xl">
            {t('howItWorks')}
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: t('step1Title'),
                description: t('step1Desc'),
              },
              {
                icon: MessageCircle,
                title: t('step2Title'),
                description: t('step2Desc'),
              },
              {
                icon: Calendar,
                title: t('step3Title'),
                description: t('step3Desc'),
              },
            ].map((step) => (
              <div key={step.title} className="card p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <step.icon className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-zinc-100">{step.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-zinc-500 sm:px-6 lg:px-8">
          {t('footer', { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  )
}
