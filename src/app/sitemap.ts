import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000'

const PUBLIC_PATHS = ['', '/marketplace']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return ['en', 'ar'].flatMap((locale) =>
    PUBLIC_PATHS.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path ? 'daily' : 'weekly',
      priority: path ? 0.8 : 1,
    }))
  )
}
