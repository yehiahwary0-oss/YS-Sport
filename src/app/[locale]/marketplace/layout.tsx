import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { generateSeoMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

  return generateSeoMetadata({
    title: t('marketplaceTitle'),
    description: t('marketplaceDescription'),
    path: `/${locale}/marketplace`,
    locales: {
      en: `${base}/en/marketplace`,
      ar: `${base}/ar/marketplace`,
    },
  })
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children
}
