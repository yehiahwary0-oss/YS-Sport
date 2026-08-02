import type { Metadata } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

export function absoluteUrl(path = ''): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

interface SeoOptions {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  path?: string
  image?: string
  /** Locale code → localized absolute URL (for hreflang/OG alternates). */
  locales?: { [locale: string]: string }
}

/** Builds a localized Metadata block with shared OG/Twitter defaults. */
export function generateSeoMetadata({
  title,
  description,
  ogTitle,
  ogDescription,
  path = '',
  image = '/cover.png',
  locales,
}: SeoOptions): Metadata {
  const url = absoluteUrl(path)

  return {
    title,
    description,
    openGraph: {
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      url,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630 }],
      type: 'website',
      locale: 'en_US',
      ...(locales ? { alternates: { locales } } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle ?? title,
      description: ogDescription ?? description,
      images: [absoluteUrl(image)],
    },
    alternates: {
      canonical: url,
      ...(locales ? { languages: locales } : {}),
    },
  }
}

/** Localized slugs for the two public indexable locales. */
export function localizedPath(locale: string, path: string): string {
  return `/${locale}${path}`
}
