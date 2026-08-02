import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/navigation'
import { ArrowRight, ShieldCheck, MessageCircle, Calendar } from 'lucide-react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FadeInOnScroll } from '@/components/shared/FadeInOnScroll'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { generateSeoMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

  return generateSeoMetadata({
    title: t('homeTitle'),
    description: t('homeDescription'),
    path: `/${locale}`,
    locales: {
      en: `${base}/en`,
      ar: `${base}/ar`,
    },
  })
}

export default function HomePage() {
  const t = useTranslations('home')
  const tn = useTranslations('nav')
  return (
    <div id="main-content" className="min-h-screen bg-navy-900">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-radial from-green-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
              {t('badge')}
            </span>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.1}>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-zinc-50 sm:text-6xl">
              {t('heroTitle')}
            </h1>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400 sm:text-lg">
              {t('heroSubtitle')}
            </p>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.3}>
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
          </FadeInOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-zinc-800/60 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { value: 500, suffix: '+', label: t('statsCoaches') },
            { value: 1200, suffix: '+', label: t('statsBookings') },
            { value: 98, suffix: '%', label: t('statsSatisfaction') },
          ].map((stat, i) => (
            <FadeInOnScroll key={stat.label} delay={i * 0.1}>
              <div className="card p-6 text-center">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  className="font-display text-3xl font-bold text-green-400"
                />
                <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll>
            <h2 className="text-center font-display text-2xl font-bold text-zinc-50 sm:text-3xl">
              {t('howItWorks')}
            </h2>
          </FadeInOnScroll>
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
            ].map((step, i) => (
              <FadeInOnScroll key={step.title} delay={i * 0.12}>
                <Card className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                    <step.icon className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold text-zinc-100">{step.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{step.description}</p>
                </Card>
              </FadeInOnScroll>
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
